import {StyleSheet, Text, TouchableNativeFeedback, View} from "react-native";
import {scanBarcode, updateUser} from "../../api";
import {storeScan} from "./Scanner";
import {updateLoadingState, updateScanResult} from "../../reducers/ui-reducer";
import moment from "moment";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import ReceiveProductNotifications from "../scan/ReceiveProductNotifications";
import {updateProductNotificationStatus} from "../../reducers/app-data-reducer";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../hooks";

function ScanHistoryListItem({navigation, item}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user);
    const username = useAppSelector(state => state.user.username);
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint);
    const email = useAppSelector(state => state.user.email);
    const scans = useAppSelector(state => state.appData.accounts[username].scans);

    return (
        <TouchableNativeFeedback onPress={async () => {
            navigation.navigate("Loading", {text: "Retrieving Scan"});
            try {
                let scan = await scanBarcode(item);

                storeScan(item, scan, scans, dispatch, user);
                dispatch(updateScanResult({scan: scan}));
                navigation.navigate("Scan", {scan: scan, returnTo: "ScanHistory"})
            } catch (e) {
                dispatch(updateLoadingState(false))
                navigation.navigate("ScanHistory");
            }
        }}>
            <View style={styles.item}>
                <View style={{flexDirection: "row"}}>
                    <View style={{flexShrink: 1, flexGrow: 1}}>
                        <>
                            <Text numberOfLines={1}
                                  style={{fontWeight: "bold"}}>{scans[item].product_display_name}</Text>
                            <Text>Scanned {moment(scans[item].date).fromNow()}</Text>
                        </>
                    </View>
                    <FontAwesome5 name={"eye"} size={25}/>

                </View>

                <View style={{paddingTop: 15}}>
                    <>
                        <Text style={styles.turnOnAlertsText}>Turn alerts on/off for product?</Text>
                        <ReceiveProductNotifications
                            style={{width: "50%"}}
                            productId={item}
                            scans={scans}
                            onPress={(val) => {
                                let bool = (val == 0);
                                updateUser({
                                    username: username,
                                    deviceEndpoint: deviceEndpoint,
                                    email: email,
                                    product_id: item,
                                    receive_notifications: bool
                                })
                                dispatch(updateProductNotificationStatus({
                                    username: username,
                                    product_id: item,
                                    product_notifications_boolean: bool
                                }))
                            }}
                            options={[
                                {
                                    label: " ON",
                                    customIcon: <FontAwesome5 name={"bell"} size={25}/>,
                                    value: 0
                                },
                                {
                                    label: " OFF",
                                    customIcon: <FontAwesome5 name={"bell-slash"} size={25}/>,
                                    value: 1
                                }
                            ]}
                        />

                    </>
                </View>
            </View>
        </TouchableNativeFeedback>
    )
}

const styles = StyleSheet.create({
    item: {
        padding: 25,
        borderBottomWidth:1,
        borderBottomColor:"gray",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    turnOnAlertsText: {
        color: "black",
        fontWeight: "200",
        marginBottom: 3
    }
})

export default ScanHistoryListItem;