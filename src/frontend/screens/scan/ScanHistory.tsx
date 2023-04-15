import { useAppSelector, useAppDispatch } from "../../hooks";
import React, {useState, useEffect, useMemo} from "react";
import {Text, FlatList, View, TouchableNativeFeedback, StyleSheet, Switch, BackHandler} from "react-native";
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

    const orderedScans = useMemo(() => {
        return new Map(Object.entries(scans).sort(([, scan1], [, scan2]) => new Date(scan2.date) - new Date(scan1.date)));
        // return [...scans].sort((scan1, scan2) => new Date(scan2.date) - new Date(scan1.date));
    }, [scans]);

    useEffect(() => {
      const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
              navigation.navigate("Profile");
              return true;
          }
      );

      return () => {backHandler.remove()};
    }, []);

    // console.log(orderedScans, "Orderd")

    return (
        <View style={{backgroundColor: "#f0f6ff"}}>
            {scans && Object.keys(scans).length > 0
                ?
                <FlatList
                    data={Array.from(orderedScans)}
                    keyExtractor={item => item}
                    renderItem={
                        ({item}) => {
                            item = item[0];
                            return (
                                <TouchableNativeFeedback onPress={async () => {
                                    navigation.navigate("Loading", {text: "Retrieving Scan"});
                                    try {
                                        let scan = await scanBarcode(item);

                                        storeScan(item, scan, scans, dispatch, user);
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
                                                <Text style={{color: "black", fontWeight: "200", marginBottom: 3}}>Turn
                                                    alerts on/off for product?</Text>
                                                <SwitchSelector
                                                    initial={getInitialNotificationState(item, scans) ? 0 : 1}
                                                    onPress={(val) => {
                                                        let bool = (val == 0);
                                                        console.log("set product " + item + " notification_status to " + bool);
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