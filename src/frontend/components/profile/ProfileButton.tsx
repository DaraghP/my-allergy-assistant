import {StyleSheet, Text, TouchableOpacity} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import React from "react";

function ProfileButton({icon, iconColor = "", text, onPress}) {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
        >
            <FontAwesome5Icon color={iconColor} name={icon} size={25}/>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        backgroundColor: "white",
        width: "100%",
        padding: 10,
        paddingVertical: 15,
        borderWidth: 0.5,
        paddingLeft: 20,
        alignItems: "center"
    },
    buttonText: {
        color: "black",
        fontSize: 20,
        marginLeft: 15
    },
})

export default ProfileButton;