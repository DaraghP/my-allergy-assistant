import {Dimensions, StyleSheet, Text, View} from "react-native";
import HomeScanButtons from "./HomeScanButtons";
import OFFSearch from "../search/OFFSearch.";
import React from "react";

const {height, width} = Dimensions.get("window");
function HomeSearchBox() {
    return (
        <View style={styles.container}>
          <Text style={styles.header}>Looking for something?</Text>
          <Text style={styles.info}>Find your product by name, or brand, and scan them for your allergens.</Text>

          <View style={styles.searchContainer}>
            <OFFSearch/>
            <Text style={styles.example}>e.g. chocolate</Text>
          </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 0.5,
        marginTop: height * 0.025,
        backgroundColor: "#f4fcf8",
        shadowColor: 1,
        shadowRadius: 1,
        elevation: 50,
        borderRadius: 10,
        width: "90%",
        alignSelf: "center",
        padding: 20
    },
    searchContainer: {
        marginTop: 15,
        marginLeft:10,
        marginRight: 10
    },
    header: {
        textAlign: "left",
        color: "black",
        fontSize: 25,
        fontWeight: "bold",
        marginLeft: 25
    },
    info: {
        marginLeft: 25,
        marginTop: 25
    },
    example: {
        marginLeft: 25,
        fontWeight: "400"
    }
})

export default HomeSearchBox;