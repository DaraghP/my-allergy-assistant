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
import {scanBarcode, updateUser} from '../api';
import ScanResult from '../screens/scan/ScanResult';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateScans } from '../reducers/app-data-reducer';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {launchImageLibrary} from "react-native-image-picker";
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { scanOCR } from 'vision-camera-ocr';
import { onChange, runOnJS } from 'react-native-reanimated';

enum ScanMode {
  Text = 'TEXT',
  Barcode = 'BARCODE',
}

interface ScannerProps {
  barcodeText: string,
  setBarcodeText: object
} 

function Scanner({barcodeText, setBarcodeText}: ScannerProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const navigation = useNavigation();
  const Stack = createNativeStackNavigator();
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef<Camera>(null);
  const scanMode = useState<ScanMode>(ScanMode.Barcode);
  const isFocused = useIsFocused();
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string>("");
  const [barcodes, setBarcodes] = useState([]);
  const [ocrResult, setOcrResult] = useState({});

  // const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.EAN_13], {
  //   checkInverted: true,
  // });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    const barcodesDetected = scanBarcodes(frame, [BarcodeFormat.EAN_13], {checkInverted: true});
    const ocrScan = scanOCR(frame);

    runOnJS(setOcrResult)(ocrScan);
    runOnJS(setBarcodes)(barcodesDetected);
  }, [])


  const takePhotoHandler = async () => {
    return await camera.current.takePhoto({
      qualityPrioritization: 'quality',
      enableAutoStabilization: true,
    });
  };

  const openCameraRoll = () => {
    let options = {title: 'Select an image'}

    launchImageLibrary(options, (res) => {
      if (!res.didCancel) {
        setPhoto(res.assets[0].uri);
        BarcodeScanning.scan(res.assets[0].uri).then((res) => {
          console.log(res, res[0].value);
          setBarcodeText(res[0].value);
        });
      }
    });
  }

  useEffect(() => {
    if (barcodes.length > 0) {
        setIsBarcodeModalOpen(true);
        setBarcodeText(barcodes[0].displayValue);
    }

    console.log('barcodes ->', barcodeText);
  }, [barcodes]);

  useEffect(() => {
    if (barcodeText !== "") {
      setIsBarcodeModalOpen(true);
    }
  }, [barcodeText])

  useEffect(() => {
    console.log(ocrResult);
    if (ocrResult.result?.text != "") {
      console.log("text-detected");
      if (ocrResult.result?.text.toLowerCase().includes("ingredients")) {
        console.log("INGREDIENTS FOUND");
        setIsOcrModalOpen(true);
      }
    } else {
      console.log("no-text-detected");
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
             enableHighQualityPhotos
             device={device}
             isActive={barcodeText == "" && isFocused}
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
                           let scan = await scanBarcode(barcodeText);
                           // if product found then store scan
                           if (scan.status == "product found") {
                             // store scan in dynamoDB table
                             let scanObj = {[barcodeText]: {date: scan.date, receive_notifications: scan.receive_notifications}};
                             updateUser({username: user.username, email: user.email, scan: scanObj});
                             // add to redux scans
                             dispatch(updateScans({username: user.username, scan: {...scanObj}}));
                           }
                           console.log("Scanner scan:", scan);
                           navigation.navigate("ScanResult", { scan: scan });
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
               modalContentText={"Would you like to scan this product's ingredients?"}
               modalBtnsConfig={{
                   option1: {
                       onPress: async () => { // 
                        console.log("yes pressed.");
                          /* TODO: 
                             - translate ingredients if needed
                             - show ingredients to user
                             - detect user allergens within the ingredients
                          */
                       },
                       text: "Yes"
                   },
                   option2: {
                       onPress: () => {
                          setOcrResult({});
                       },
                       text: "No",
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
                   console.log("taking photo!");
                   takePhotoHandler().then(photo => {
                     console.log(photo.path);
                   });
                 }
               }/>
             </View>
             <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
               {photo != "" && (
                   <>
                     <Text style={{color: "white"}}>Image showing</Text>
                     <Image style={{width: 100, height: 100}} source={{uri: photo}}/>
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
  buttonSpacing: {
    // marginVertical: ,
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
