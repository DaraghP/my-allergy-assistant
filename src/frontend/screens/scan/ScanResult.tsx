import React, {useEffect} from "react";
import {Text, StyleSheet, View} from "react-native";

function ScanResult({navigation, route}) {
    const scan = route.params?.scan;

    useEffect(() => {
        console.log("scan -> ", scan);
    }, [])

    return (
        <View style={styles.container}>
            <Text>Product Found! : {scan?.product_name}</Text>
            <Text>Contains allergens: {scan?.allergens}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
   container: {
       flex: 1,
       padding: 10,
   }
});

export default ScanResult;