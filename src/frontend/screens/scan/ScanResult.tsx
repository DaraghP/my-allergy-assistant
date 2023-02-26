import _ from "lodash";
import React, {useEffect} from "react";
import {Text, StyleSheet, View} from "react-native";
import {useAppSelector} from "../../hooks";

function ScanResult({navigation, route}) { 
    const scan = route.params?.scan;

    // mock data
    const possibleAllergens = ['peanut', 'wheat', 'milk', 'yeast', 'water', 'sucralose']
    
    const username = useAppSelector(state => state.user.username);
    const user = useAppSelector(state => state.appData.accounts[username]);

    const tokenise = (text: string) => {
        return _.words(text);
    }

    const getAllergensFromText = () => {
        let allergensFound = []
        
        // check if any allergens are in the text
        possibleAllergens.forEach((allergen) => {
            if (scan?.ocrResult?.text.toLowerCase().includes(allergen)){
                allergensFound.push(allergen);
            }
        })

        // check if user allergens were found
        let userAllergensFound = []
        allergensFound.forEach((item) => {
            if (item in user?.allergens){
                console.log("Allergen found!");
            } else {
                console.log(item, " found, but user not allergic");
            }// 
        })

        return allergensFound;
    }

    useEffect(() => {
        console.log("test: ", tokenise(scan?.ocrResult?.text.toLowerCase()))
    }, [])


    return (
        <View style={styles.container}>
            <Text>Product Found! : {scan?.product_name}</Text>
            <Text>Contains allergens: {scan?.allergens}</Text>
            <Text>OCR: {scan?.ocrResult?.text.toLowerCase()}</Text>
            
            {/* loop over possibleAllergens and check if present in text */}
            {getAllergensFromText().map((allergen, indx) => (// 
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