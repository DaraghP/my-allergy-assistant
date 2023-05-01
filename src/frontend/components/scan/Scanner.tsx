import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevices, useFrameProcessor
} from 'react-native-vision-camera';
import {scanBarcodes} from 'vision-camera-code-scanner';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {ocrPreprocessing, scanBarcode, updateUser, getInitialNotificationState} from '../../api';
import ScanResult from '../../screens/scan/ScanResult';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateScans } from '../../reducers/app-data-reducer';
import {launchImageLibrary} from "react-native-image-picker";
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { scanOCR } from 'vision-camera-ocr';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { runOnJS } from 'react-native-reanimated';
import {readFile, TemporaryDirectoryPath, writeFile} from "react-native-fs";
import {updateLoadingState, updateScanMode, updateScanResult} from '../../reducers/ui-reducer';
import {Image as compressor} from "react-native-compressor";
import ScannerButtons from "./ScannerButtons";
import ScannerModals from "./ScannerModals";
import {FoodBarcodeFormats} from "../../constants";

export enum ScanMode {
  Text = 'TEXT',
  Barcode = 'BARCODE',
  Detect = 'DETECT'
}

export const storeScan = (barcodeText, scan, scans, dispatch, user) => {
  let scanObj = {
    [barcodeText]: {
      product_display_name: scan.product_display_name,
      date: scan.date,
      receive_notifications: getInitialNotificationState(barcodeText, scans)
    }
  };

  updateUser({username: user.username, deviceEndpoint: user.deviceEndpoint, email: user.email, scan: scanObj});

  // add to redux scans
  dispatch(updateScans({username: user.username, scan: {...scanObj}}));
}

function Scanner() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const scans = useAppSelector(state => state.appData.accounts[user.username]?.scans);
  const scanMode = useAppSelector(state => state.ui.scanMode);
  const navigation = useNavigation();
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();

  const [lastBarcodeSeen, setLastBarcodeSeen] = useState<string | null>(null);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [isProductNotFoundModalOpen, setIsProductNotFoundModalOpen] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string>("");
  const [barcodes, setBarcodes] = useState([]);
  const [ocrResult, setOcrResult] = useState({});
  const [ingredientsFound, setIngredientsFound] = useState(false);
  const [isDetected, setIsDetected] = useState(false);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    // worklet for real-time OCR / Barcode Scanning
    const barcodesDetected = scanBarcodes(frame, FoodBarcodeFormats, {checkInverted: true});
    const ocrScan = scanOCR(frame);

    runOnJS(setOcrResult)(ocrScan);
    runOnJS(setBarcodes)(barcodesDetected);
  }, []);

  const changeScanModeHandler = () => {
    const scanModes = [ScanMode.Barcode, ScanMode.Detect, ScanMode.Text];
    let nextMode: ScanMode = scanModes[(scanModes.indexOf(scanMode) + 1) % scanModes.length];
    dispatch(updateScanMode(nextMode));
    setIsDetected(false);
    setIngredientsFound(false);
    setBarcodes([]);
    setOcrResult({});
    setLastBarcodeSeen("");
  };

  const takePhotoHandler = async () => {
    return await camera.current.takePhoto({
      enableAutoStabilization: true,
    });
  };

  const openCameraRoll = () => {
    // gets image from gallery, first scanning for barcode, or text if no barcode is found
    let options = {title: 'Select an image'}

    launchImageLibrary(options, (image) => {
      if (!image.didCancel) {
        setPhoto(image.assets[0].uri);
      
        // scan barcode from image
        BarcodeScanning.scan(image.assets[0].uri).then(async (res) => {
          if (res.length > 0) {
            const barcode = res[0]?.value ?? lastBarcodeSeen;
            barcodeScan(barcode)
          }
          else {
            // scan ingredients text from image
            setIngredientsFound(true);
            setIsOcrModalOpen(true);
          }
        });
      }
    });
  }

  const OCR = async (photo, isFromCameraRoll: boolean) => {
      // prepare image for OCR
      navigation.navigate("Loading", {text: "Scanning..."});

      try {
        // compress for AWS Lambda 6mb request limit
        const compressed = await compressor.compress(photo, {quality: 0.66});
        let photoBase64 = await readFile(compressed, "base64");
        photoBase64 = await ocrPreprocessing(photoBase64);
        const ocrImage = `data:image/jpeg;base64,${photoBase64}`;
        await writeFile(`${TemporaryDirectoryPath}/img.jpg`, photoBase64, "base64");

        const text = await TextRecognition.recognize(`file:///${TemporaryDirectoryPath}/img.jpg`);

        if (!isFromCameraRoll) {
          setIngredientsFound(false);
          setIsOcrModalOpen(false);
        }

        dispatch(updateScanResult({scan: {ocrResult: text, ocrImage: photo, ocrImageOutput: ocrImage}}))
        navigation.navigate("ScanResult");
      }
      catch (e) {
        dispatch(updateLoadingState(false));
        navigation.navigate("Scan");
      }
  }

  const barcodeScan = (barcodeText = null) => {
      const barcode = barcodes[0]?.displayValue ?? barcodeText;
      setIsDetected(true);
      setLastBarcodeSeen(barcode);

      navigation.navigate("Loading", {text: "Scanning..."});
      scanBarcode(barcode).then((scan) => {
        // if product found then store scan
        if (scan.status == "product found") {
          // store scan in dynamoDB table
          storeScan(barcode, scan, scans, dispatch, user);

          dispatch(updateScanResult({scan: scan}))
          navigation.navigate("ScanResult");
          setLastBarcodeSeen("");
        }
        else {
          //product not found in OFF database
          // display error modal

          navigation.navigate("Scan");
          setIsDetected(false);
          setIsProductNotFoundModalOpen(true);
        }
      }).catch((e) => {
        navigation.navigate("Scan");
        dispatch(updateLoadingState(false));
        setIsProductNotFoundModalOpen(true);
      });
  }

  useEffect(() => {
    // make sure to reset isDetected when navigating to scan screen
    if (isFocused) {
      setIsDetected(false)
    }
  }, [isFocused])

  useEffect(() => {
    const barcodeCondition = scanMode === ScanMode.Barcode || scanMode === ScanMode.Detect;

    if (barcodeCondition && barcodes.length > 0 && barcodes[0]?.displayValue !== lastBarcodeSeen && isFocused) {
      barcodeScan();
    }
  }, [barcodes]);

  useEffect(() => {
    const ocrCondition = scanMode === ScanMode.Text || scanMode === ScanMode.Detect;

    if (ocrCondition && ocrResult?.result?.blocks?.length > 0 && ocrResult.result?.text != "" && ocrResult.result?.text.toLowerCase().includes("ingredient")) {
        if (!ingredientsFound) {
          takePhotoHandler().then((photo) => {
            setPhoto("file://" + photo.path)
          }).then(() => {
            setIsDetected(true)
            setIngredientsFound(true);
          });
        }
        else {
          setIngredientsFound(false);
        }
    }
    else {
      setIsDetected(false);
    }
  }, [ocrResult])

  return (
    <View style={{flex: 1}}>
       {device !== undefined && (
        <>
           <Camera
             ref={camera}
             frameProcessor={frameProcessor}
             frameProcessorFps={5}
             photo={true}
             device={device}
             isActive={!isOcrModalOpen && !isProductNotFoundModalOpen && isFocused}
             style={StyleSheet.absoluteFill}
             enableZoomGesture
           />

          <View style={{flex: 1, minHeight: "75%"}}/>
          <ScannerButtons
              isDetected={isDetected}
              openCameraRoll={openCameraRoll}
              onTakeScan={() => {
                 if (isDetected && photo) {
                   setIsOcrModalOpen(true);
                 }
              }}
              changeScanMode={changeScanModeHandler}
          />

          <ScannerModals
              photo={photo}
              setPhoto={setPhoto}
              lastBarcodeSeen={lastBarcodeSeen}
              ocrModalConfig={{
                isOpen: isOcrModalOpen,
                setIsOpen: setIsOcrModalOpen,
                onPressYes: async () => {
                  OCR(photo, false);
                },
                onPressNo: () => {
                  setOcrResult({});
                  setIngredientsFound(false);
               }
              }}

              productNotFoundModalConfig={{
                isOpen: isProductNotFoundModalOpen,
                setIsOpen: setIsProductNotFoundModalOpen,
                onPressYes: () => {
                  setLastBarcodeSeen("");
                  navigation.navigate("Scan");
                }
              }}
          />

        </>
       )}
     </View>
  );
}

export default Scanner;
