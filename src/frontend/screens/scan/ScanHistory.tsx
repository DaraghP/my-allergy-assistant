import { useAppSelector } from "../../hooks";
import React, { useEffect } from "react";
import {Text, FlatList, View, TouchableNativeFeedback, StyleSheet, Switch} from "react-native";
import _ from "lodash";
import moment from 'moment';
import SwitchSelector from "react-native-switch-selector";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

function ScanHistory({navigation}) {
    const username = useAppSelector(state => state.user.username);
    const scans = useAppSelector(state => state.appData.accounts[username].scans);
    
    const mySort = (scans) => {
        let scanKeysOrdered = Object.keys(scans).sort((a, b) => new Date(scans[a].date).getTime() - new Date(scans[b].date).getTime());
        console.log(scanKeysOrdered);
        
        let orderedScans = {}//[];
        scanKeysOrdered.forEach(function (key) {
            orderedScans[key] = scans[key];
        });
        return orderedScans;
    };

    const orderedScans = mySort(scans);
    
    // on page load:
    useEffect(() => {
        console.log("Previous scans => ", scans);
        console.log("orderedScans => ", orderedScans);
    }, []);


    const toggleNotificationSwitch = (item) => {
        console.log(item, "switch pressed!");
    }
    return (
        <>
            {Object.keys(scans).length > 0
                ?
                <FlatList
                    data={Object.keys(orderedScans)}
                    renderItem={
                        ({item}) => (
                            <TouchableNativeFeedback onPress={() => {console.log("Go to product page:", {item})}}>
                                <View style={styles.item}>
                                    <View style={{flexShrink: 1, flexGrow: 1}}>
                                        <>
                                            <Text numberOfLines={1} style={{fontWeight: "bold"}}>{scans[item].product_display_name}</Text>
                                            <Text>Scanned {moment(scans[item].date).fromNow()}</Text>
                                        </>
                                    </View>
                                    <View style={{paddingLeft: 10}}>
                                        <>
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
            
        </>
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
        flexDirection: "row",
        justifyContent: "space-between"
    }
});

export default ScanHistory;