import React, {useEffect, useRef, useState} from "react";
import {
    ScrollView,
    StyleSheet,
    BackHandler
} from "react-native";
import BarcodeScanResult from "../../components/scan/BarcodeScanResult/BarcodeScanResult";
import OCRScanResult from "../../components/scan/OCRScanResult/OCRScanResult";
import { useIsFocused } from "@react-navigation/native";
import OFFDataFooter from "../../components/scan/BarcodeScanResult/OFFDataFooter";
import ScanResultImage from "../../components/scan/ScanResultImage";
import {useAppDispatch, useAppSelector} from "../../hooks";
import {updateScanResult} from "../../reducers/ui-reducer";

function ScanResult({navigation, route, backPressHandler}) {
    const dispatch = useAppDispatch();
    const scan = useAppSelector(state => state.ui.scanResult).scan;
    const isFocused = useIsFocused();
    const scrollRef = useRef<ScrollView>()

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                if (backPressHandler) {
                    backPressHandler();
                }
                return true;
            }
        );

        return () => {backHandler.remove()};
    }, [backPressHandler])

    useEffect(() => {
        scrollRef.current?.scrollTo({x: 0, y: 0, animated: true});
    }, [scan, isFocused])

    return (
        <>
            <ScrollView ref={scrollRef} contentContainerStyle={{height: "auto", flexDirection: "column"}} style={styles.container}>
                <ScanResultImage/>

                {!scan?.ocrResult ? 
                    <BarcodeScanResult/>
                    :
                    <OCRScanResult/>
                }
            </ScrollView>

            {!scan?.ocrResult &&
                <OFFDataFooter/>
            }
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ScanResult;