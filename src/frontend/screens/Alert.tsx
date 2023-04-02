import { useAppDispatch, useAppSelector } from "../hooks";
import { FlatList, SafeAreaView, View, TouchableNativeFeedback, Text, StyleSheet} from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useEffect} from "react";
import { updateLoadingState } from "../reducers/ui-reducer";
import { openNotification, deleteNotification } from "../reducers/app-data-reducer";
import { useNavigation } from "@react-navigation/native";
import { scanBarcode } from "../api";
import moment from 'moment';


function AlertScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);
    const userAllergens = useAppSelector(state => state.appData.accounts[state.user.username].allergens);//
    // console.log("\n\nuserAllergens: "+ JSON.stringify(userAllergens));
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username].notifications);

    useEffect(() => {
        console.log("my username: " + username);
        console.log("Alerts!", notifications);
    }, [])

    const containsMatch = (listA, listB) => {
        if (listB) {
            console.log("listA: " + listA);
            console.log("listB: " + listB);
            let matchFound = false;
            listB.forEach((item) => {
                console.log("testing if " + item + " in listA");
                if (new Set(listA).has(item)){
                    console.log("MATCH: "+item);
                    matchFound = true;
                }
            })
            return matchFound;
        }
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "lightgrey"}}>
            {!notifications || notifications?.length == 0 ?
                <Text style={styles.noAlerts}>No alerts received</Text>
                :
                <FlatList
                    inverted={true}
                    contentContainerStyle={{
                        flexGrow: 1, justifyContent: 'flex-end',
                      }}
                    style={{
                        flex: 1,
                        borderRadius: 1,
                        borderWidth: 0.5,
                        borderColor: "grey",
                        height: "100%"
                    }}
                    data={notifications}
                    keyExtractor={(alert, index) => alert.productID+alert.reporterID}
                    renderItem={(alert) => (
                        <TouchableNativeFeedback key={alert.item.productID+alert.item.reporterID} style={{borderBottomColor: "black", borderBottomWidth: 5}} onPress={async () => {
                            dispatch(openNotification({username: username, index: alert.index}));
                            console.log("notification ", alert);
                            dispatch(updateLoadingState());
                            navigation.navigate("Loading", {text: "Scanning..."});
                            let scan = await scanBarcode(alert.item.productID);
                            navigation.navigate("Scan", {scan: scan, returnTo: "Alerts"})
                            dispatch(updateLoadingState())
                        }}>
                            <View style={styles.item}>
                                {/* <View style={{flexShrink: 1}}> */}
                                    
                                    {alert.item.reporterID === username
                                        ?
                                        <>
                                        <View style={{flexDirection: "row", justifyContent: "space-between", borderBottomColor: "lightgrey", borderBottomWidth: 1, paddingBottom: 5}}>
                                        <Text style={{marginTop: 5}}>
                                            <FontAwesome5 style={{marginRight: 5}}
                                                color={"green"}
                                                name={"check-circle"}
                                                size={20}/>{"  "}We received your report
                                        </Text>
                                        <Text style={{alignSelf: "flex-end", textAlign: "right"}}>{moment(alert.item.date).fromNow()}</Text>
                                        </View>
                                        <Text numberOfLines={1} style={{fontWeight: "bold", flex: 1, flexWrap: "wrap", marginTop: 5, paddingRight: 50}}>{alert?.item.productName}</Text>
                                        <Text>Users have been notified. Thanks for your help!</Text>
                                        <View style={{flexDirection: "row", alignItems: "center",}}>
                                            <Text>View for more information{"  "}</Text>
                                            <FontAwesome5 style={{marginRight: 5}} name="info-circle" size={20}/>
                                        </View>
                                        </>
                                        :
                                        <>
                                        <View style={{flexDirection: "row", justifyContent: "space-between", borderBottomColor: "lightgrey", borderBottomWidth: 1, paddingBottom: 5}}>
                                        <Text style={{marginTop: 5}}>
                                            <FontAwesome5 style={{marginRight: 5}}
                                                color={containsMatch(userAllergens, alert.item.suspectedAllergens) ? "red" : "orange"} 
                                                name="exclamation-triangle"
                                                size={20}/>{"   "}
                                            Product Reported</Text>
                                        <Text style={{alignSelf: "flex-end", textAlign: "right"}}>{moment(alert.item.date).fromNow()}</Text>
                                        </View>
                                        <Text numberOfLines={1} style={{fontWeight: "bold", flex: 1, flexWrap: "wrap", marginTop: 5, textTransform: "capitalize", paddingRight: 50}}>{alert?.item.productName}</Text>
                                        <Text style={{flex: 1, flexWrap: "wrap", marginTop: 5}}> Suspected to contain:{"  "}
                                            {alert?.item.suspectedAllergens.map((allergen, index) => {
                                                if (new Set(userAllergens).has(allergen)){
                                                    return <Text style={{fontWeight: "bold"}}>{allergen}  </Text>
                                                } else {
                                                    return <Text>{allergen}  </Text>
                                                }
                                            }
                                            )}
                                        </Text>
                                        <View style={{flexDirection: "row", alignItems: "center",}}>
                                            <Text>View for more information{"  "}</Text>
                                            <FontAwesome5 style={{marginRight: 5}} name="info-circle" size={20}/>
                                        </View>
                                        </>
                                    }
                                {/* </View> */}
                                {!alert.item.isOpened &&
                                    <View style={{...styles.redDot}}/>
                                }
                            </View>
                        </TouchableNativeFeedback>
                    )}
                />

            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    item: {
        width: "100%",
        flex: 1,
        // flexDirection: "row",
        padding: 10,
        backgroundColor: "white",
        marginBottom: 1,
        borderBottomColor: "lightgrey",
        borderBottomWidth: 3,
        borderRadius: 25
    }, 
    noAlerts: {
        fontSize: 25,
        color: "black",
        alignSelf: "center",
        padding: 20
    },
    redDot: {
        position: "absolute",
        alignSelf: "flex-end",
        borderRadius: 20,
        backgroundColor: "red",
        height: 10,
        width: 10,
        right: 50,
        top: "50%",
        bottom: "50%"
        // height: "auto"
    }
})

export default AlertScreen;