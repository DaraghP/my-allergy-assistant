import {FlatList, StyleSheet} from "react-native";
import React from "react";
import ScanHistoryListItem from "./ScanHistoryListItem";

function ScanHistoryList({navigation, data}) {
    return (
        <FlatList
            data={data}
            keyExtractor={item => item}
            renderItem={
                ({item}) => {
                    item = item[0];
                    return <ScanHistoryListItem navigation={navigation} item={item}/>;
                }
            }
        />

    )
}

const styles = StyleSheet.create({
    item: {
        padding: 25,
        borderBottomWidth:1,
        borderBottomColor:"gray",
        flexDirection: "column",
        justifyContent: "space-between"
    }
})

export default ScanHistoryList;