import _ from "lodash";
import React, {useEffect, useState} from "react";
import {Text, StyleSheet, View, Image, Button, TouchableOpacity, Modal, Linking} from "react-native";
import {useAppSelector, useAppDispatch} from "../../hooks";
import ALLERGENS from "../../allergens.json";
import SwitchSelector from "react-native-switch-selector";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AppModal from "../../components/AppModal";
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { Report, addReportToDynamo, getProductReports, updateUser, getInitialNotificationState } from "../../api";
import {updateProductNotificationStatus} from "../../reducers/app-data-reducer";

function ScanResult({navigation, route}) {
    const dispatch = useAppDispatch();
    const scan = route.params?.scan;

    const possibleAllergens = ALLERGENS.data;

    const username = useAppSelector(state => state.user.username);
    const email = useAppSelector(state => state.user.email);
    const usersScanHistory = useAppSelector(state => state.appData.accounts[username].scans);
    // im getting new error: cannot read property 'scans' of undefined in Scanner.tsx
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint); // 
    const user = useAppSelector(state => state.appData.accounts[username]);
    const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState([]);
    // console.log("myAllergens: " + user?.allergens);
    const reportDropdownData = [
        // {key:'1', value:'Milk'},
        // {key:'2', value:'Hazelnuts'},
        // {key:'3', value:'Wheat'},
    ];
    
    if (user?.allergens){
        user?.allergens?.forEach((allergen) => (reportDropdownData.push(allergen)));
    }

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
        return allergensFound;
    }

    // useEffect(() => {
    // console.log("test: ", tokenise(scan?.ocrResult?.text.toLowerCase()))
    // }, [])
    return (
        <View style={styles.container}>
            
            <Text style={{fontSize: 30, fontWeight: 'bold', margin:'3.5%', flexWrap: "wrap", textAlign: 'center'}}>
                {scan?.product_display_name}
            </Text>
            {/* the way we could do notifications: 
            reporter POSTS to lambda function report which puts something in db, then publishes to a topic,
            another lambda function which has a trigger using that topic gets messages from the report publish, message could be stringified json can include product id, users waiting to be notified etc,
            when the lambda function retrieves it, it will go through each user and notify them */}

            {/* 1 just for the lambda function that will notify, it will trigger whenever the reporter publishes to the topic, then the other lambda function will look at the json message and notify the users */}
            {/* the topic is just for the other lambda function to trigger/start,  

                so user submits report in app, report gets added to dynamo through api lambda1 call, when get 200 response that dynamo was updated
                another lambda function2 is called with json in message, which sends the notifications to users

                report is now created in dynamo when user submits report through app
                -- atm only works for POST, need to work on PUT still to append report to existing product_id


                ok i'm gonna find out how to set up device tokens and send them to sns locally,
                back, almost have it, will continue looking into it, may have to go before 6 as well btw 
                
            */}
            <View style={{display:"flex", justifyContent:"space-between", marginLeft: 20}}>
                {/*//, flexDirection: "row"}}>*/}
                {/* {console.log("")} */}
                {(!scan?.ingredients_complete_boolean) && (!scan?.ingredients_text)
                    ?
                    <Text style={{alignSelf: "flex-start", paddingBottom: 20}}>
                        Ingredients not available.{"\n"}{"\n"}
                        Allergen information unavailable{"\n"}{"\n"}
                        <Text style={{color: "blue", textDecorationLine: "underline"}}
                            onPress={() => Linking.openURL(`https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=${scan?.product_code}`)}    
                        >
                            Click here
                        </Text> to update the product information via Open Food Facts to inform future scanners.

                    </Text>
                    :
                    
                    <Text style={{alignSelf: "flex-start", paddingBottom: 20}}><Text style={{fontWeight: "bold"}}>Ingredients:</Text>  {scan?.ingredients_text}</Text>
                }
                    {scan?.allergens_from_ingredients == ""
                        ?
                        <Text></Text>
                        :
                        <Text><Text style={{fontWeight: "bold"}}>Allergens:</Text>  {scan?.allergens_from_ingredients}</Text>
                    }
                    {scan?.traces_tags == ""
                        ?
                        <Text></Text>
                        :
                        <Text><Text style={{fontWeight: "bold"}}>May contain traces of:</Text>  {scan?.traces_tags}</Text>
                    }
                    {scan?.traces_tags == "" && scan?.allergens_from_ingredients == "" &&
                        <Text style={{fontWeight: "bold"}}>No allergens detected</Text>
                    }
                
                
                <Image
                    source={{uri: scan?.product_image}}
                    // TODO: get image size from OFF API, and check for back-up images first befire displaying default
                    style={{width: 208, height: 400, marginRight:'3.5%', marginLeft: 'auto', alignSelf: "flex-end", borderRadius:20}}
                />
                <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 25}}>
                    <View style={{justifyContent: "center", alignItems: "center"}}>
                        <Text style={{paddingTop: 20, paddingBottom: 10}}>Receive notifications if product is reported?</Text>
                        <SwitchSelector
                            initial={getInitialNotificationState(scan?.product_code, usersScanHistory) ? 0 : 1}
                            onPress={(val) => {
                                let bool = (val==0);
                                console.log("set product "+scan?.product_code+" notification_status to " + bool);
                                updateUser({username: username, deviceEndpoint: deviceEndpoint, email: email, product_id: scan?.product_code, receive_notifications: bool})
                                // 
                                dispatch(updateProductNotificationStatus({username: username, product_id: scan?.product_code, product_notifications_boolean: bool}))
                            }}
                            options={[
                                {label: " ON", customIcon: <FontAwesome5 name={"bell"} size={25}/>, value: 0},
                                {label: " OFF", customIcon: <FontAwesome5 name={"bell-slash"} size={25}/>, value: 1}
                            ]}
                            height={40}
                            style={{width:240}}
                            buttonMargin={2}
                            hasPadding
                        />
                    </View>
                    <TouchableOpacity 
                        style={{margin: 20, padding: 20, backgroundColor: "red", borderRadius: 20, flexDirection: "row"}}
                        onPress={() => {
                            console.log("open report modal.");
                            setIsReportModalOpen(true);
                        }}
                    >
                        <FontAwesome5 color={"white"} name={"flag-checkered"} size={25}/>
                        <Text style={{color: "white", paddingLeft: 20}}>Report product</Text>
                    </TouchableOpacity>
                </View>
            </View>

        {/* 
            DynamoDB tables: User table, Report table, Notifications table
            
            - when user scans a product, update user scans attribute, before loading product page, check reports table for that product
            - when user reports a product, post/update report to report table, when response received, get all users who have notifications turned on for that product
            - when a user turns notifications for product X on, update user scans table, and update notifications table
            
        */}

            <View style={{backgroundColor: "#c1bbb7", padding: 10, marginTop: 25}}>
                    <Text style={{alignSelf: "center"}}>Product data provided by Open Food Facts.{' '}
                        <Text style={{color: "blue", textDecorationLine: "underline"}}
                            onPress={() => Linking.openURL('https://world.openfoodfacts.org/')}    
                        >
                            Click here
                        </Text> to learn more
                    </Text>
                </View>
            <AppModal
                isModalOpen={{state: isReportModalOpen, setState: (bool: boolean) => {setIsReportModalOpen(bool)}}}
                headerText={"Are you sure you want to report this product?"}
                modalContentText={"Only report products if it caused you to have an allergic reaction, and you have consulted with a doctor to ensure you're not allergic to any of the listed ingredients. \n\n This will notify all users who previously scanned this product's barcode. \n A warning will also be displayed on the product page to warn future scanners. \n\n If you are certain what caused your allergic reaction, please select the allergen(s) from the dropdown list:"}
                // TODO:
                modalContent={
                    <MultipleSelectList
                        label={'Allergen'}
                        setSelected={(value)=>setSelectedList(value)}
                        data={reportDropdownData}
                        save="value"
                        // onSelect={()=>alert(selectedList)}
                    />
                }
                modalBtnsConfig={{
                    option1: {
                        onPress: () => { 
                            console.log("report cancelled.")
                        },
                        text: "No - Cancel",
                    },
                    option2: {
                        onPress: () => {
                            let reportObj : Report = {username: username, productId: scan?.product_code, suspectedAllergens: selectedList}
                            addReportToDynamo(reportObj);
                            // let reportObj2 : Report = {productId: scan?.product_code}
                            // let reportsResponse = await getProductReports(reportObj2);
                            // console.log(reportsResponse);
                            console.log("sending report for product " + scan?.product_code +  " with allergens {" +selectedList + "} to dynamo");
                            setSelectedList([]);
                        },
                        text: "Yes - Report Product",
                    }
                }}

            />
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