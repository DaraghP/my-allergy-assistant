import {StyleSheet, Text, View, Button} from "react-native";
import React, {useEffect, useState} from "react";
import {Auth, API} from "aws-amplify";
import {getSingleUser, postNewUser, deleteUser, updateUser, getAllUsers} from "../api";
import {useAppSelector} from "../hooks";


function HomeScreen() {
    let user = useAppSelector(state => state.user);

    return (
        <View style={styles.container}>

            <Text>MyAllergyAssistant HOMEPAGE new</Text>
            <Text>{user.email}</Text>
            {/* */}
            <Button title={"Get users"} onPress={() => {getAllUsers()}}/>
            <Button title={"POST new user"} onPress={() => {postNewUser({username: 'user6', email: 'email6@email6.com', allergens: []})}}/>
            <Button title={"Delete user"} onPress={() => {deleteUser({username: 'user6', email: 'email6@email6.com'})}}/>
            <Button title={"Update user"} onPress={() => {updateUser({username: user.username, email: user.email, allergens: []})}}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {display: "flex", justifyContent: "center", alignItems: "center"}
});

export default HomeScreen;