import { useAppSelector } from "../../hooks";
import React, { useEffect } from "react";
import {Text, FlatList, View, TouchableNativeFeedback} from "react-native";

function ScanHistory({navigation}) {
    const username = useAppSelector(state => state.user.username);
    const scans = useAppSelector(state => state.appData.accounts[username].scans);
    // on page load:
    useEffect(() => {
        console.log("Previous scans => ", scans);
    }, []);
    /*
        TODO:
                Using <FlatList> display each scan,
                displaying ProductName, notification status, timeScanned, and clicking brings to product page
    */
    return (
        <>
            {Object.keys(scans).length > 0
                ?
                // Object.keys(scans).map((key) => (
                //     <Text key={key}>{key}: {scans[key].date}</Text>
                // ))
                <FlatList
                    data={Object.keys(scans)}
                    renderItem={
                        (item) => (
                            <TouchableNativeFeedback onPress={() => {console.log("Go to product page:", {item})}}>
                                <View>
                                    <>
                                        <Text style={{fontWeight: "bold"}}>{scans[item].product_display_name}</Text>
                                        <Text>Scanned on: {scans[item].date}</Text>
                                    </>
                                </View>
                            </TouchableNativeFeedback>
                        )
                    }
                />
                :
                <Text style={{textAlign: "center", paddingVertical: 20}}>No scanned products</Text>
            }
            <Text>Test</Text>
            
        </>
    )
}

export default ScanHistory;