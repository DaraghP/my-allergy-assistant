import { useAppDispatch, useAppSelector } from "../hooks";
import { FlatList, ScrollView, RefreshControl, SafeAreaView, View, TouchableNativeFeedback, Text, StyleSheet, TouchableOpacity, Linking} from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useEffect, useState, useCallback} from "react";
import { updateLoadingState } from "../reducers/ui-reducer";
import { openNotification, deleteNotification } from "../reducers/app-data-reducer";
import { useNavigation } from "@react-navigation/native";
import { scanBarcode } from "../api";
import moment from 'moment';
import { checkNotifications, requestNotifications, openSettings } from 'react-native-permissions';


function AlertScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);
    const userAllergens = useAppSelector(state => state.appData.accounts[state.user.username].allergens);//
    // console.log("\n\nuserAllergens: "+ JSON.stringify(userAllergens));
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username].notifications);
    const [notificationPerms, setNotificationPerms] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        console.log("my username: " + username);
        console.log("Alerts!", notifications);
    }, [])

    useEffect(() => {
        checkNotifications().then(({status, settings}) => {
            setNotificationPerms(status);
            if (status === "denied") {
                console.log("notification permissions denied, display message.");
            }
        });
    }, [notificationPerms])

    const containsMatch = (listA, listB) => {
        if (listB) {
            // console.log("listA: " + listA);
            // console.log("listB: " + listB);
            let matchFound = false;
            listB.forEach((item) => {
                // console.log("testing if " + item + " in listA");
                if (new Set(listA).has(item)){
                    // console.log("MATCH: "+item);
                    matchFound = true;
                }
            })
            return matchFound;
        }
    }

    // const onRefresh = useCallback(() => {
    //     setRefreshing(true);
    //     setTimeout(() => {
    //         setRefreshing(false);
    //     }, 1000);
    // }, []) 

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#f0f6ff"}}>
            <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={() => {setNotificationPerms("");}}/>}>
            {(!notifications || notifications?.length == 0) &&
                <Text style={styles.noAlerts}>No alerts received</Text>
            }
            {notificationPerms === "denied" &&
             <Text style={styles.noAlerts}>Notification permissions must be enabled to receive alerts.
                <TouchableOpacity onPress={() => openSettings()}
                ><Text>Enable notifications</Text></TouchableOpacity></Text>
            }
                <FlatList
                    // inverted={true}
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
                    keyExtractor={(alert, index) => {return index.toString()}}
                    renderItem={(alert) => (
                        <TouchableNativeFeedback key={alert.index} style={{borderBottomColor: "black", borderBottomWidth: 5}} onPress={async () => {
                            dispatch(openNotification({username: username, index: alert.index}));
                            console.log("notification ", alert);
                            dispatch(updateLoadingState());
                            navigation.navigate("Loading", {text: "Scanning..."});
                            let scan = await scanBarcode(alert.item.productID);
                            navigation.navigate("Scan", {scan: scan, returnTo: "Alerts"});
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
                                                    return <Text key={index.toString()} style={{fontWeight: "bold"}}>{allergen}  </Text>
                                                } else {
                                                    return <Text key={index.toString()}>{allergen}  </Text>
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

            {/* } */}
            </ScrollView>
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