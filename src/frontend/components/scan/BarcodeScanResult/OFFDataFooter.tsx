import {Linking, Text, View} from "react-native";
import React from "react";

function OFFDataFooter() {
    return (
        <View style={{backgroundColor: "#c1bbb7", padding: 10}}>
            <Text style={{alignSelf: "center"}}>Product data provided by Open Food Facts.{' '}
                <Text style={{color: "blue", textDecorationLine: "underline"}}
                    onPress={() => Linking.openURL('https://world.openfoodfacts.org/')}
                >
                    Learn more
                </Text>
            </Text>
        </View>
    )
}

export default OFFDataFooter;