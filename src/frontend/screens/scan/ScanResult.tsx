import _ from "lodash";
import React, {useEffect} from "react";
import {Text, StyleSheet, View} from "react-native";
import {useAppSelector} from "../../hooks";
import ALLERGENS from "../../allergens.json";


function ScanResult({navigation, route}) { 
    const scan = route.params?.scan;

    const possibleAllergens = ALLERGENS.data;

    const username = useAppSelector(state => state.user.username);
    const user = useAppSelector(state => state.appData.accounts[username]);

    const tokenise = (text: string) => {
        return _.words(text);
    }

    const getAllergensFromText = () => {
        let allergensFound = [];
        // split OCR text by commas

        let ingredients = scan?.ocrResult?.text.toLowerCase().split(",");

        // if not null
        if (ingredients){
            // loop over each ingredient
            ingredients?.forEach((ingredient) => {


                // for item in allergens,         e.g. x = {"Walnuts": ["walnuts", "walnut"]}
                possibleAllergens.forEach((allergenData) => {

                    // for each searchString in allergen value list
                    _.values(allergenData)[0].forEach((allergen) => {
                        // if allergen found & user allergic //
                        if (ingredient.includes(allergen) && (user?.allergens.includes(_.keys(allergenData)[0]))) {
                            console.log("WARNING! Allergen: " + _.keys(allergenData)[0] + " detected. User IS allergic. Listed as: " + ingredient);
                        }
                        // if allergenfound & user not allergic
                        if (ingredient.includes(allergen) && !(user?.allergens.includes(_.keys(allergenData)[0]))) {
                            // console.log(_.keys(allergenData)[0], " in ", user?.allergens, ": ", );
                            console.log("WARNING! Allergen: " + _.keys(allergenData)[0] + " detected. | User NOT allergic. | Listed as: " + ingredient);
                        }
                    });
                });
            });
        }
        // TODO: check for 'oat' allergy, using below pseudocode
        // PSEUDOCODE for AllergenIdentificationAlgorithm()
        // warnings = ...
        // ingredients = output.split(",")
        // for i in ingredients:
        //      for a in allergens:
        //          if a == oat:
        //              for w in i:
              //          if w == a:
                  //        add_warning
//                  else:
          //          if i.contains(a) && (a in user.allergens):
          //              add_big_warning
          //          elif i.contains(a) && !(a in user.allergens):
          //              add_small_warning
        // if len(warnings) > 0
        //    show_warnings
        return allergensFound;
    }

    // useEffect(() => {
        // console.log("test: ", tokenise(scan?.ocrResult?.text.toLowerCase()))
    // }, [])

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