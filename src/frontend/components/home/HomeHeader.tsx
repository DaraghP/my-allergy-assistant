import {StyleSheet, Text, View} from "react-native";
import React from "react";

function HomeHeader() {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>MyAllergyAssistant</Text>
      </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 25,
        marginBottom: 25,
        backgroundColor: "ghostwhite",
        elevation: 5,
        shadowRadius: 3,
        shadowColor: "black"
    },
    logo: {
        textAlign:'center',
        fontWeight:"bold",
        fontSize: 32
    }
})

export default HomeHeader;