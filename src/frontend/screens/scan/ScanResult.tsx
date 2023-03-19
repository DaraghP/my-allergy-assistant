import _ from "lodash";
import React, {useEffect, useState} from "react";
import {Text, StyleSheet, View} from "react-native";
import {useAppSelector} from "../../hooks";
import ALLERGENS from "../../allergens.json";
import getAllergensFromText from "../../ocr-postprocessing";

function ScanResult({navigation, route}) {
    const scan = route.params?.scan;
    const username = useAppSelector(state => state.user.username);
    const user = useAppSelector(state => state.appData.accounts[username]);

    return (
        <View style={styles.container}>
            <Text>Product Found! : {scan?.product_name}</Text>
            <Text>Contains allergens: {scan?.allergens}</Text>
            <Text>OCR: {scan?.ocrResult?.text.toLowerCase()}</Text>
            
            {/* loop over possibleAllergens and check if present in text */}
            {getAllergensFromText(scan?.ocrResult?.text, user).map((allergen, indx) => (// 
                <Text>Allergen {indx}: {allergen}</Text>
            ))}

            {/* loop over each block in text found
            {scan?.ocrResult?.blocks.map((block, indx) => (
                <Text>Block {indx}: {block.text}</Text>
            ))} */}
        </View>
    )
}

const styles = StyleSheet.create({
   container: {
       flex: 1,
       padding: 10,
   }
});

export default ScanResult;