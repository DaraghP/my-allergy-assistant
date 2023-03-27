import _ from "lodash";
import React, {useEffect, useState} from "react";
import {Dimensions, ScrollView, Text, StyleSheet, View, Image, Button, TouchableOpacity, Modal, Linking} from "react-native";
import {useAppSelector, useAppDispatch} from "../../hooks";
import ALLERGENS from "../../allergens.json";
import BarcodeScanResult from "../../components/BarcodeScanResult";
import OCRScanResult from "../../components/OCRScanResult";

function ScanResult({navigation, route}) {
    const {height, width} = Dimensions.get("window");
    const scan : object = route.params?.scan;
    const username = useAppSelector(state => state.user.username);
    const user = useAppSelector(state => state.appData.accounts[username]);

    // console.log("myAllergens: " + user?.allergens);
    const reportDropdownData = [
        // {key:'1', value:'Milk'},
        // {key:'2', value:'Hazelnuts'},
        // {key:'3', value:'Wheat'},
    ];
    
    if (user?.allergens){
        user?.allergens?.forEach((allergen) => (reportDropdownData.push(allergen)));
    }

    // useEffect(() => {
    // console.log("test: ", tokenise(scan?.ocrResult?.text.toLowerCase()))
    // }, [])
    return (
        <>
            <ScrollView contentContainerStyle={{height: "auto", flexDirection: "column"}} style={styles.container}>
                <View style={{flex: 1,  width: width * 1, height: height * 0.35, justifyContent: "center", alignItems: "center", alignContent: "center", flexDirection: "column", backgroundColor: "#ffffff", padding: 15, borderBottomWidth: 0.5, borderColor: "grey"}}>
                    {scan?.product_image || scan?.ocrImage ?
                        <Image
                            source={{uri: scan?.product_image || scan?.ocrImage}}
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
        // <View>
        //     <Text style={{backgroundColor: "yellow"}}>Contains allergens: {scan?.allergens}</Text>
        //     <Text>OCR: {scan?.ocrResult?.text.toLowerCase()}</Text>
        //
        //
        //     {/* loop over possibleAllergens and check if present in text */}
        //     {/*{getAllergensFromText().map((allergen, indx) => (// */}
        //     {/*    <Text>Allergen {indx}: {allergen}</Text>*/}
        //     {/*))}*/}
        //
        //     {/* loop over each block in text found
        //     {scan?.ocrResult?.blocks.map((block, indx) => (
        //         <Text>Block {indx}: {block.text}</Text>
        //     ))} */}
        // </View>
        // </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
        // alignItems: 'strech',
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