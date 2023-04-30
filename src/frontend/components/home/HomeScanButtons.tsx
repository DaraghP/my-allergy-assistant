import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {updateScanMode, updateScanResult} from "../../reducers/ui-reducer";
import {ScanMode} from "../scan/Scanner";
import React from "react";
import {useAppDispatch} from "../../hooks";
import HomeScanButton from "./HomeScanButton";
import {
    ScanBarcodeColor,
    ScanBarcodeIconName,
    ScanBothColor, ScanBothIconName,
    ScanIngredientsColor,
    ScanIngredientsIconName
} from "../../constants";

const {height, width} = Dimensions.get("window");
function HomeScanButtons({navigation}) {
    const dispatch = useAppDispatch();

    return (
        <>
            <View style={styles.boxesContainer}>
              <HomeScanButton
                  text={"Scan Barcode"}
                  color={ScanBarcodeColor}
                  iconName={ScanBarcodeIconName}
                  iconSize={height * 0.1}
                  onPress={() => {
                    navigation.navigate("Scan");
                    dispatch(updateScanResult({}));
                    dispatch(updateScanMode(ScanMode.Barcode));
                  }}
              />

              <HomeScanButton
                  text={"Scan Ingredients"}
                  color={ScanIngredientsColor}
                  iconName={ScanIngredientsIconName}
                  iconSize={height * 0.1}
                  onPress={() => {
                    navigation.navigate("Scan");
                    dispatch(updateScanResult({}));
                    dispatch(updateScanMode(ScanMode.Text));
                  }}
              />
            </View>

            <HomeScanButton
                style={{marginTop: 20}}
                isVertical={false}
                text={"Scan Both"}
                color={ScanBothColor}
                iconName={ScanBothIconName}
                iconSize={height * 0.075}
                onPress={() => {
                  navigation.navigate("Scan");
                  dispatch(updateScanResult({}));
                  dispatch(updateScanMode(ScanMode.Detect));
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
  boxesContainer: {
    height: "auto",
    flexDirection: "row",
    padding: 10
  },
});

export default HomeScanButtons;