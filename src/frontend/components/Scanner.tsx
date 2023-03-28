import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import {
  Camera,
  useCameraDevices, useFrameProcessor
} from 'react-native-vision-camera';
import {BarcodeFormat, useScanBarcodes, scanBarcodes} from 'vision-camera-code-scanner';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppModal from "./AppModal";
import {ocrPreprocessing, scanBarcode, updateUser, getInitialNotificationState} from '../api';
import ScanResult from '../screens/scan/ScanResult';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateScans } from '../reducers/app-data-reducer';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {launchImageLibrary} from "react-native-image-picker";
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { scanOCR } from 'vision-camera-ocr';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { onChange, runOnJS } from 'react-native-reanimated';
import ImagePicker from 'react-native-image-crop-picker';
import {readFile, readFileAssets, TemporaryDirectoryPath, unlink, writeFile} from "react-native-fs";
import { updateLoadingState } from '../reducers/ui-reducer';

export enum ScanMode {
  Text = 'TEXT',
  Barcode = 'BARCODE',
  Detect = 'DETECT'
}

interface ScannerProps {
  barcodeText: string,
  setBarcodeText: object
}

export function storeScan(barcodeText, scan, scans, dispatch, user) {

    console.log(barcodeText)
    let scanObj = {[barcodeText]: {product_display_name: scan.product_display_name, date: scan.date, receive_notifications: getInitialNotificationState(barcodeText, scans)}};
    console.log("\nscanObj -> " + JSON.stringify(scanObj));

    updateUser({username: user.username, deviceEndpoint: user.deviceEndpoint, email: user.email, scan: scanObj});

    // add to redux scans
    dispatch(updateScans({username: user.username, scan: {...scanObj}}));
    console.log("\nScanner scan:", scan);
}

function Scanner({barcodeText, setBarcodeText}: ScannerProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const scans = useAppSelector(state => state.appData.accounts[user.username]?.scans);
  const scanMode = useAppSelector(state => state.ui.scanMode);
  const navigation = useNavigation(); // 
  const Stack = createNativeStackNavigator();
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [isProductNotFoundModalOpen, setIsProductNotFoundModalOpen] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string>("");
  const [editPhoto, setEditPhoto] = useState<string>("");
  const [barcodes, setBarcodes] = useState([]);
  const [ocrResult, setOcrResult] = useState({});
  const [ingredientsFound, setIngredientsFound] = useState(false);

  const foodBarcodeFormats = [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.EAN_8] 

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    const barcodesDetected = scanBarcodes(frame, foodBarcodeFormats, {checkInverted: true});
    const ocrScan = scanOCR(frame);

    // if (ocrScan.result.blocks.length > 0) {
    //   setScanMode(ScanMode.Text);
    // }
    // else if (barcodesDetected.length > 0) {
    //   setScanMode(ScanMode.Barcode);
    // }
    // else {
    //   setScanMode(ScanMode.Detect);
    // }

    runOnJS(setOcrResult)(ocrScan);
    runOnJS(setBarcodes)(barcodesDetected);
  }, [])


  const takePhotoHandler = async () => {
    return await camera.current.takePhoto({
      enableAutoStabilization: true,
    });
  };

  const openCameraRoll = () => {
    let options = {title: 'Select an image'}

    launchImageLibrary(options, (image) => {
      if (!image.didCancel) {
        setPhoto(image.assets[0].uri); // 
      
        // scan barcode from image
        BarcodeScanning.scan(image.assets[0].uri).then(async (res) => {
          if (res.length > 0){
            console.log("res: ", res);
            console.log(res, res[0]?.value);
            setBarcodeText(res[0]?.value ?? "");
          } else {
            // scan ingredients text from image
            OCR(image.assets[0].uri, true);
          }
        });
      }
    });
  }

  const OCR = async (photo, isFromCameraRoll: boolean) => {
        if (isFromCameraRoll) {
          setIngredientsFound(true);
          setIsOcrModalOpen(true);
        }

        // prepare image for OCR
        dispatch(updateLoadingState());
        navigation.navigate("Loading", {text: "Scanning..."});
        console.log("set loading state");
        let photoBase64 = await readFile(photo, "base64");
        photoBase64 = await ocrPreprocessing(photoBase64);
        const ocrImage = `data:image/jpeg;base64,${photoBase64}`;
        setEditPhoto(ocrImage);
        await writeFile(`${TemporaryDirectoryPath}/img.jpg`, photoBase64, "base64");

        const text = await TextRecognition.recognize(`file:///${TemporaryDirectoryPath}/img.jpg`);

        if (!isFromCameraRoll) {
          setIngredientsFound(false);
          setIsOcrModalOpen(false);
        }

        dispatch(updateLoadingState());
        console.log("reset loading state");
        navigation.navigate("ScanResult", { scan: {ocrResult: text, ocrImage: photo, ocrImageOutput: ocrImage} });
  }

  useEffect(() => {
    if (barcodes.length > 0) {
        setIsBarcodeModalOpen(true);
        setBarcodeText(barcodes[0].displayValue);
    }

    // console.log('barcodes ->', barcodeText);
  }, [barcodes]);

  useEffect(() => {
    if (barcodeText !== "") {
      setIsBarcodeModalOpen(true);
    }
  }, [barcodeText])

  useEffect(() => {
    // console.log(ocrResult);
    if (ocrResult.result?.text != "") {
      // console.log("text-detected");
      if (ocrResult.result?.text.toLowerCase().includes("ingredients")) {
        console.log("INGREDIENTS FOUND");
        if (!ingredientsFound) {
          takePhotoHandler().then((photo) => {
            setPhoto("file://" + photo.path)
          }).then(() => {
            setIngredientsFound(true);
            setIsOcrModalOpen(true);
          })
        }
      }
    } else {
      // console.log("no-text-detected");
    }
  }, [ocrResult])

  return (
    <View style={{flex: 1}}>
       {device !== undefined && (
        <>
             <Stack.Navigator>
               <Stack.Screen name="ScanResult" >
                 {(props) => (
                     <ScanResult {...props} />
                 )}
               </Stack.Screen>
             </Stack.Navigator>

           <Camera
             ref={camera}
             frameProcessor={frameProcessor}
             frameProcessorFps={5}
             photo={true}
             device={device}
             isActive={!ingredientsFound && barcodeText == "" && isFocused}
             style={StyleSheet.absoluteFill}
             enableZoomGesture
           />

           <AppModal
               isModalOpen={{state: isBarcodeModalOpen, setState: (bool: boolean) => {setIsBarcodeModalOpen(bool)}}}
               headerText={"Scan barcode"}
               modalContentText={"Would you like to scan this product?"}
               modalBtnsConfig={{
                   option1: {
                       onPress: async () => {
                           console.log("Yes pressed. product:", barcodeText);
                           dispatch(updateLoadingState());
                           navigation.navigate("Loading", {text: "Scanning..."});
                           let scan = await scanBarcode(barcodeText);
                           // if product found then store scan

                           if (scan.status == "product found") {
                             // store scan in dynamoDB table

                             storeScan(barcodeText, scan, scans, dispatch, user);

                             dispatch(updateLoadingState());
                             navigation.navigate("ScanResult", { scan: scan });
                           } else {
                             //product not found in OFF database
                            // display error modal
                            setIsProductNotFoundModalOpen(true);

                           }
                       },
                       text: "Yes"
                   },
                   option2: {
                       onPress: () => {
                           console.log("No pressed.");
                           console.log(barcodes, barcodeText)
                           setBarcodeText("");
                       },
                       text: "No",
                   }
               }}
          />

          <AppModal
               isModalOpen={{state: isOcrModalOpen, setState: (bool: boolean) => {setIsOcrModalOpen(bool)}}}
               headerText={"Scan Ingredients"}
               modalContent={
                  <>
                    <Image style={{height: 200, width: 200}} source={{uri: photo}} />
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={styles.crop}
                        onPress={() => {
                          ImagePicker.openCropper({
                            path: photo,
                            freeStyleCropEnabled: true,
                            compressImageQuality: 1,
                            enableRotationGesture: true,
                          }).then(image => {
                            setPhoto(image.path);
                          });
                        }}
                    >
                      <Text>Crop</Text>
                    </TouchableOpacity>
                  </>
               }
               modalContentText={"Would you like to scan this product's ingredients?"}
               modalBtnsConfig={{
                   option1: {
                       onPress: async () => {
                          console.log("yes pressed.");
                          OCR(photo, false);
                       },
                       text: "Yes"
                   },
                   option2: {
                       onPress: () => {
                          setOcrResult({});
                          setIngredientsFound(false);
                       },
                       text: "No",
                   }
               }}
           />

            <AppModal
               isModalOpen={{state: isProductNotFoundModalOpen, setState: (bool: boolean) => {setIsProductNotFoundModalOpen(bool)}}}
               headerText={"Product NOT FOUND :("}
               modalContentText={"Barcode '" + barcodeText + "' not found in product database.\nTry scan ingredients instead"}
               modalBtnsConfig={{
                   option1: {
                       onPress: async () => {
                        setBarcodeText("");
                        console.log();
                       },
                       text: "Continue"
                   }
               }}
          />

           <View style={styles.bottomButtonsContainer}>
             <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>

               <FontAwesome5.Button backgroundColor={"rgba(0,0,0,0)"} color={"white"} name={"images"} size={50} onPress={
                 () => {
                   console.log("select image from camera roll.");
                   openCameraRoll();
                 }
               }/>
             </View>

             <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
               <FontAwesome5.Button name={"circle"} backgroundColor={"rgba(0,0,0,0)"} size={70} onPress={
                 () => {

                 }
               }/>
             </View>
             <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
               <Text style={{color: "white"}}>
                  {scanMode == ScanMode.Detect ? 
                    "Scanning for barcode or ingredients..." 
                    : 
                    scanMode == ScanMode.Barcode ?
                    "Found barcode!"
                    :
                    "Found ingredients!"
                  }
                </Text>

               {editPhoto != "" && (
                   <>
                     <Text style={{color: "white"}}>Image showing</Text>
                     <Image style={{width: 100, height: 100}} source={{uri: editPhoto}}/>
                   </>
                 )}
             </View>

           </View>
         </>
       )}
     </View>
  );
}

const styles = StyleSheet.create({
  bottomButtonsContainer: {
    width:"100%",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5 
  },
  crop: {
    backgroundColor: "ghostwhite",
    borderColor: "lightgrey",
    borderWidth: 0.2,
    padding: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  photoButton: {
    paddingBottom: "6%",
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 200,
    borderColor: '#000',
    borderWidth: 1,
  },
});

export default Scanner;
