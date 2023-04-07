import { useAppSelector, useAppDispatch } from "../../hooks";
import React, { useState, useEffect } from "react";
import {Text, FlatList, View, TouchableNativeFeedback, StyleSheet, Switch} from "react-native";
import _ from "lodash";
import moment from 'moment';
import SwitchSelector from "react-native-switch-selector";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { updateUser, getInitialNotificationState, scanBarcode } from "../../api";
import { updateProductNotificationStatus } from "../../reducers/app-data-reducer";
import { updateLoadingState } from "../../reducers/ui-reducer";
import { storeScan } from "../../components/Scanner";

function ScanHistory({navigation}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user);
    const username = useAppSelector(state => state.user.username);
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint);
    const email = useAppSelector(state => state.user.email);
    const scans = useAppSelector(state => state.appData.accounts[username].scans);
    const [orderedScans, setOrderedScans] = useState([]);
    
    const mySort = (scans) => {
        let scanKeysOrdered = Object.keys(scans).sort((a, b) => {
            // console.log(scans[a].product_display_name, scans[a].date, scans[b].product_display_name, scans[b].date)
            return new Date(scans[a].date).getTime() - new Date(scans[b].date).getTime()
        }).reverse();

        let orderedScans = {};
        scanKeysOrdered.forEach(function (key) {
            orderedScans[key] = scans[key];
        });
        return orderedScans;
    };

    // on page load:
    useEffect(() => {
        if (scans) {

            // console.log("Previous scans => ", scans);
            // console.log("orderedScans => ", orderedScans);

            setOrderedScans(mySort(scans));
        }
    }, [scans]);

    const toggleNotificationSwitch = (item) => {
        console.log(item, "switch pressed!");
    }

    return (
        <View style={{backgroundColor: "#f0f6ff"}}>
            {scans && Object.keys(scans).length > 0
                ?
                <FlatList
                    data={Object.keys(orderedScans)}
                    keyExtractor={item => item}
                    renderItem={
                        ({item}) => ( 
                            <TouchableNativeFeedback onPress={async () => {
                                console.log("Go to product page:", item)
                                dispatch(updateLoadingState());
                                navigation.navigate("Loading", {text: "Retrieving Scan"});
                                let scan = await scanBarcode(item);
                                storeScan(item, scan, scans, dispatch, user);
                                navigation.navigate("Scan", {scan: scan, returnTo: "ScanHistory"})
                                dispatch(updateLoadingState());
                            }}>
                                <View style={styles.item}>
                                    <View style={{flexShrink: 1, flexGrow: 1}}>
                                        <>
                                            <Text numberOfLines={1} style={{fontWeight: "bold"}}>{scans[item].product_display_name}</Text>
                                            <Text>Scanned {moment(scans[item].date).fromNow()}</Text>
                                        </>
                                    </View>
                                    <View style={{paddingTop: 25}}>
                                        <>
                                            <SwitchSelector
                                                initial={getInitialNotificationState(item, scans) ? 0 : 1}
                                                onPress={(val) => {
                                                    let bool = (val==0);
                                                    console.log("set product "+item+" notification_status to " + bool);
                                                    updateUser({username: username, deviceEndpoint: deviceEndpoint, email: email, product_id: item, receive_notifications: bool})
                                                    dispatch(updateProductNotificationStatus({username: username, product_id: item, product_notifications_boolean: bool}))
                                                }}
                                                options={[
                                                    {label: " ON", customIcon: <FontAwesome5 name={"bell"} size={25}/>, value: 0},
                                                    {label: " OFF", customIcon: <FontAwesome5 name={"bell-slash"} size={25}/>, value: 1}
                                                ]}
                                                style={{width: "50%"}}
                                                buttonMargin={2}
                                                hasPadding
                                            />

                                        </>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        )
                    }
                />
                :
                <Text style={{textAlign: "center", paddingVertical: 20}}>No scanned products</Text>
            }
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        backgroundColor: "white",
        borderRadius: 1,
        borderWidth: 0.5,
        borderColor: "grey"
    },
    item: {
        padding: 25,
        borderBottomWidth:1,
        borderBottomColor:"gray",
        flexDirection: "column",
        justifyContent: "space-between"
    }
});

export default ScanHistory;