import {StyleSheet, ToastAndroid, TouchableOpacity, View} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import React, {useEffect, useState} from "react";
import {ScanMode} from "./Scanner";
import {useAppSelector} from "../../hooks";
import {useIsFocused} from "@react-navigation/native";
import ScannerButton from "./ScannerButton";
import {
    ScanBarcodeColor,
    ScanBarcodeIconName,
    ScanBothColor,
    ScanBothIconName,
    ScanIngredientsColor, ScanIngredientsIconName
} from "../../constants";


// Buttons used at the bottom of the scanner, one for gallery, taking scan, switching scan mode
function ScannerButtons({isDetected, openCameraRoll, onTakeScan, changeScanMode}) {
    const isAppLoading = useAppSelector(state => state.ui.loading);
    const scanMode = useAppSelector(state => state.ui.scanMode);
    const [modeStyle, setModeStyle] = useState<object>({color: "", icon: ""});
    const isFocused = useIsFocused();

    useEffect(() => {
        // wrapped in a timeout as a hack to fix toast from appearing in different screens
        const id = setTimeout(() => {
          if (!isAppLoading && isFocused) {
            switch (scanMode) {
              case ScanMode.Barcode:
                setModeStyle({color: ScanBarcodeColor, icon: ScanBarcodeIconName});
                ToastAndroid.show("Scan Barcode", ToastAndroid.SHORT);
                break;
              case ScanMode.Detect:
                setModeStyle({color: ScanBothColor, icon: ScanBothIconName});
                ToastAndroid.show("Scan Both", ToastAndroid.SHORT);
                break;
              case ScanMode.Text:
                setModeStyle({color: ScanIngredientsColor, icon: ScanIngredientsIconName});
                ToastAndroid.show("Scan Ingredients", ToastAndroid.SHORT);
                break;
            }
          }
        }, 1)

        return () => {
          clearTimeout(id);
        }
    }, [scanMode, isFocused]);


    return (
      <View style={styles.bottomButtonsContainer}>
            <ScannerButton>
               <FontAwesome5.Button
                   backgroundColor={"rgba(0,0,0,0)"}
                   color={"white"}
                   name={"images"}
                   size={50}
                   onPress={() => {
                    openCameraRoll();
                   }}
               />
            </ScannerButton>

            <ScannerButton>
               <TouchableOpacity
                 activeOpacity={100}
                 onPress={onTakeScan}
               >
                 <FontAwesome5Icon
                     color={isDetected ? "red" : "rgba(255,255,255,0.5)"}
                     name={isDetected ? "dot-circle" : "circle"}
                     size={70}
                 />
               </TouchableOpacity>
            </ScannerButton>

            <ScannerButton>
                <TouchableOpacity onPress={changeScanMode} style={styles.scanMode}>
                  <FontAwesome5Icon
                      color="white"
                      style={{...styles.modeButton, backgroundColor: modeStyle.color, borderColor: isDetected ? "#39ff14" : "orange"}}
                      name={modeStyle.icon}
                      size={25}
                  />
                </TouchableOpacity>
            </ScannerButton>
       </View>
    )
}

const styles = StyleSheet.create({
    bottomButtonsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 5,
    },
    modeButton: {
        flexDirection: "column",
        width: "100%",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        borderRadius: 10,
        borderWidth: 3,
    },
    scanMode: {
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center"
    }
})

export default ScannerButtons;