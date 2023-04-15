import _ from "lodash";
import React, {useEffect, useState, useRef} from "react";
import {
    Dimensions,
    ScrollView,
    Text,
    StyleSheet,
    View,
    Image,
    Button,
    TouchableOpacity,
    Modal,
    Linking,
    BackHandler
} from "react-native";
import {useAppSelector, useAppDispatch} from "../../hooks";
import BarcodeScanResult from "../../components/BarcodeScanResult";
import OCRScanResult from "../../components/OCRScanResult";
import { useIsFocused } from "@react-navigation/native";


function ScanResult({navigation, route, backPressHandler}) {
    const {height, width} = Dimensions.get("window");
    const scan : object = route.params?.scan;
    const username = useAppSelector(state => state.user.username);
    const user = useAppSelector(state => state.appData.accounts[username]);
    const isFocused = useIsFocused();
    const scrollRef = useRef<ScrollView>()

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                if (backPressHandler)
                    backPressHandler();
                return true;
            }
        );

        return () => {backHandler.remove()};
    }, [backPressHandler])

    useEffect(() => {
        if (isFocused) {
            scrollRef.current?.scrollTo(0, 0, true);
        }
    }, [isFocused])
    
    return (
        <>
            <ScrollView contentContainerStyle={{height: "auto", flexDirection: "column"}} style={styles.container}>
                <View style={{flex: 1,  width: width * 1, height: height * 0.35, justifyContent: "center", alignItems: "center", alignContent: "center", flexDirection: "column", backgroundColor: "#ffffff", padding: 15, borderBottomWidth: 0.5, borderColor: "grey"}}>
                    {scan?.product_image || scan?.ocrImage ?
                        <Image
                            source={{uri: scan?.product_image || scan?.ocrImageOutput}}
                            // TODO: get image size from OFF API, and check for back-up images first befire displaying default
                            style={{resizeMode: "contain", width: width * 1, height: height * 0.35, alignSelf: "center"}}
                        />
                        :
                        <Text style={{fontWeight: "200", alignSelf: "center", textAlign: "center", fontSize: 25}}>No Image Available</Text>
                    }
                </View>

                {!scan?.ocrResult ? 
                    <BarcodeScanResult scan={scan}/>
                    :
                    <OCRScanResult scan={scan}/>
                }

            </ScrollView>

            {!scan?.ocrResult &&
                <View style={{backgroundColor: "#c1bbb7", padding: 10}}>
                    <Text style={{alignSelf: "center"}}>Product data provided by Open Food Facts.{' '}
                        <Text style={{color: "blue", textDecorationLine: "underline"}}
                            onPress={() => Linking.openURL('https://world.openfoodfacts.org/')}
                        >
                            Click here
                        </Text> to learn more
                    </Text>
                </View>
            }
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    top_row: {
        backgroundColor: "magenta",
        flexDirection: "row",
        flexWrap: "wrap",
        height: "auto",
    },
    image_column: {
        flexDirection: "column",
        flexWrap: "wrap",
        minWidth: "25%",
        alignSelf: "flex-end"
        // backgroundColor: "green"
    },
    text_column: {
        flexDirection: "column",
        flexWrap: "wrap",
        maxWidth: "50%",
    }
});

export default ScanResult;