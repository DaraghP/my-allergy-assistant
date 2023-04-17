import { useAppSelector } from "../../hooks";
import React, {useEffect, useMemo} from "react";
import {Text, View, StyleSheet, BackHandler} from "react-native";
import ScanHistoryList from "../../components/scan/ScanHistoryList";

function ScanHistory({navigation}) {
    const username = useAppSelector(state => state.user.username);
    const scans = useAppSelector(state => state.appData.accounts[username].scans);

    const orderedScans = useMemo(() => {
        return new Map(Object.entries(scans).sort(([, scan1], [, scan2]) => new Date(scan2.date) - new Date(scan1.date)));
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

    return (
        <View style={styles.container}>
            {scans && Object.keys(scans).length > 0
                ?
                <ScanHistoryList navigation={navigation} data={Array.from(orderedScans)}/>
                :
                <Text style={{textAlign: "center", paddingVertical: 20}}>No scanned products</Text>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        backgroundColor: "#f0f6ff",
        borderRadius: 1,
        borderWidth: 0.5,
        borderColor: "grey"
    },
});

export default ScanHistory;