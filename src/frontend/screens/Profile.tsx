import React, {useEffect, useState} from "react";
import {Button, StyleSheet, Text, View} from "react-native";
import {Auth} from "aws-amplify";
import AllergySelectionList from "../components/AllergySelectionList";

function ProfileScreen() {
    const LogOut = () => {
        return (
            <Button
                color={'red'}
                title={'Log out'}
                onPress={() => {
                    Auth.signOut();
                }}
            />
        );
    };

    const confirmAllergens = () => {
        // for now will do nothing
    }

    return (
        <>
            <LogOut/>

            {/* TODO: Decide if this needs an accordion */}
            <View style={{flex: 1, padding: 5}}>

                <Text style={styles.heading}>Change your allergies</Text>
                <AllergySelectionList onConfirm={confirmAllergens}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    heading: {
        color: "black",
        fontSize: 25,
        fontWeight: "900",
        marginVertical: 10
    }
})

export default ProfileScreen;