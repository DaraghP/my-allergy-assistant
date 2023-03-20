import _ from "lodash";
import React, {useEffect} from "react";
import {Text, StyleSheet, View, Image, Button, TouchableOpacity} from "react-native";
import {useAppSelector} from "../../hooks";
import ALLERGENS from "../../allergens.json";
import SwitchSelector from "react-native-switch-selector";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';


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
            {/*<View>*/}
            {/*style={styles.top_row}>*/}
            {/*<View style={styles.text_column}>*/}
            <Text style={{fontSize: 30, fontWeight: 'bold', margin:'3.5%', flexWrap: "wrap", textAlign: 'center'}}>
                {scan?.product_display_name}
            </Text>
            {/*</View>*/}
            <View style={{display:"flex", justifyContent:"space-between", marginLeft: 20}}>
                {/*//, flexDirection: "row"}}>*/}
                <Text style={{alignSelf: "flex-start", paddingBottom: 20}}><Text style={{fontWeight: "bold"}}>Ingredients:</Text>  {scan?.ingredients_text}</Text>
                {/*<Text>Allergens: {scan?.allergens}</Text>*/}
                {scan?.allergens_from_ingredients == ""
                    ?
                    <Text></Text>
                    :
                    <Text><Text style={{fontWeight: "bold"}}>Allergens:</Text>  {scan?.allergens_from_ingredients}</Text>
                }
                {scan?.may_contain == ""
                    ?
                    <Text></Text>
                    :
                    <Text><Text style={{fontWeight: "bold"}}>May contain traces of:</Text>  {scan?.may_contain}</Text>
                }
                {
                    scan?.may_contain == "" && scan?.allergens_from_ingredients == "" &&
                    <Text style={{fontWeight: "bold"}}>No allergens detected</Text>
                }
                <Image
                    source={{uri: scan?.product_image}}
                    // TODO: get image size from OFF API
                    style={{width: 208, height: 400, marginRight:'3.5%', marginLeft: 'auto', alignSelf: "flex-end", borderRadius:20}}
                />
                <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 25}}>
                    <View style={{justifyContent: "center", alignItems: "center"}}>
                        <Text style={{paddingTop: 20, paddingBottom: 10}}>Receive notifications if product is reported?</Text>
                        <SwitchSelector
                            options={[
                                {label: " ON", customIcon: <FontAwesome5 name={"bell"} size={25}/>, value: 1},
                                {label: " OFF", customIcon: <FontAwesome5 name={"bell-slash"} size={25}/>, value: 0}
                            ]}
                            height={40}
                            style={{width:240}}
                            buttonMargin={2}
                            hasPadding
                            initial={0}
                        />
                    </View>
                    <TouchableOpacity style={{margin: 20, padding: 20, backgroundColor: "red", borderRadius: 20, flexDirection: "row"}}>
                        <FontAwesome5 color={"white"} name={"flag-checkered"} size={25}/>
                        <Text style={{color: "white", paddingLeft: 20}}>Report product</Text>
                    </TouchableOpacity>
                    {/*<Button*/}
                    {/*    title={"Report product"}*/}
                    {/*    color={"red"}*/}
                    {/*/>*/}
                </View>


            </View>
            {/*</View>*/}
            {/*<Text>Product Found! : {scan?.product_name}</Text>*/}
            {/*<View style={styles.image_column}>*/}

            {/*</View>*/}
        </View>
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
        padding: 10,
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