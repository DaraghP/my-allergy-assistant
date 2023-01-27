import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {runOnJS} from 'react-native-reanimated';
import {BarcodeFormat, useScanBarcodes} from 'vision-camera-code-scanner';
import { useIsFocused } from '@react-navigation/native';
import AppModal from "./AppModal";

enum ScanMode {
  Text = 'TEXT',
  Barcode = 'BARCODE',
}

function Scanner() {
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef<Camera>(null);
  const scanMode = useState<ScanMode>(ScanMode.Barcode);
  const isFocused = useIsFocused();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [barcodeText, setBarcodeText] = useState<string>("");
  // const [isBarcodeDetected, setIsBarcodeDetected] = useState<boolean>(false);

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.EAN_13], {
    checkInverted: true
  })

  const takePhotoHandler = async () => {
    return await camera.current.takePhoto({
      qualityPrioritization: 'quality',
      enableAutoStabilization: true,
    });
  };

  useEffect(() => {
    if (barcodes.length > 0) {
      setIsModalOpen(true);
      setBarcodeText(barcodes[0].displayValue);
    }
    
    console.log('barcodes ->', barcodeText);
  }, [barcodes]);

  return (
    <View style={{flex: 1}}>
      {device !== undefined && (
        <>
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
              isModalOpen={{state: isModalOpen, setState: (bool: boolean) => {setIsModalOpen(bool)}}}
              headerText={"Scan barcode"}
              modalContentText={"Would you like to scan this product?"}
              modalBtnsConfig={{
                  option1: {
                      onPress: () => {
                          console.log("Yes pressed.");
                          // TODO: scanBarcode(barcodeText);

                      },
                      text: "Yes"
                  },
                  option2: {
                      onPress: () => {
                          console.log("No pressed.");
                          setBarcodeText("");
                      },
                      text: "No",
                  }
              }}
          />
          <TouchableOpacity
            onPress={() => {
              takePhotoHandler().then(photo => {
                console.log(photo.path);
              });
            }}
            style={styles.photoButton}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photoButton: {
    flexDirection: 'row',
    width: 55,
    paddingVertical: 25,
    backgroundColor: '#fff',
    borderRadius: 200,
    marginTop: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 25,
    borderColor: '#000',
    borderWidth: 1,
  },
});

export default Scanner;
