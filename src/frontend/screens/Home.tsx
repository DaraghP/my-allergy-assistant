import {StyleSheet, Text, View, Button} from "react-native";
import React, {useEffect, useState} from "react";
import {Auth, API} from "aws-amplify";

async function postNewUser() {
    API.post('myAPI', '/users', { body: {TableName: "User-dev", Item: {username: 'NEWuser', email: 'NEWtest@fakeemail.com'}}, headers: { 'Content-Type': 'application/json', Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`} }).then(res => {
        console.log("SUCCESS 200 USer created");
        console.log(res);
    }).catch(err => {
        console.log(err);
        console.log(err.response.data);
    })
}

async function deleteUser() {
    API.del('myAPI', '/users', { body: {TableName: "User-dev", Key: {username: 'NEWuser', email: 'NEWtest@fakeemail.com'}}, headers: { 'Content-Type': 'application/json', Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`} }).then(res => {
        console.log("SUCCESS 200 User deleted"); // Key: {username: 'testuser', email: 'test@fakeemail.com'}
        console.log(res); //
    }).catch(err => {
        console.log(err);
        console.log(err.response.data);
    })
}

async function updateUser() {
    API.put('myAPI', '/users', { body: {TableName: "User-dev", Key: {username: 'test1', email: 'test1@test1.com'}, UpdateExpression: "set allergens = :allergen_list", ExpressionAttributeValues: { ":allergen_list": ['allergen11', 'allergen4'] }, ReturnValues: "UPDATED_NEW"}, headers: { 'Content-Type': 'application/json', Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`} }).then(res => {
        console.log("SUCCESS 200 User updated");
        console.log(res);
    }).catch(err => {
        console.log(err);
        console.log(err.response.data);
    })
}

async function getUsers() {
    // console.log("token: ", Auth.user.signInUserSession.idToken.jwtToken);
    console.log("get users from dynamoDB...");

    API.get('myAPI', '/users', { body: {Key: {username: 'testuser', email: 'test@fakeemail.com'}, TableName: "User-dev"}, headers: { 'Content-Type': 'application/json', Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`}}).then(res => {
        console.log("SUCCESS 200");
        console.log(res);
    }).catch(err => {
;
        console.log(err);
        console.log(err.response.data);
    })
}
function HomeScreen() {
    const [email, setEmail] = useState('');

    useEffect(() => {
        Auth.currentAuthenticatedUser().then((user) => setEmail(user.attributes.email))
    }, [Auth]);

    return (
        <View style={styles.container}>

            <Text>MyAllergyAssistant HOMEPAGE</Text>
            <Text>{email}</Text>
            <Button title={"Get users"} onPress={() => {getUsers()}}/>
            <Button title={"POST new user"} onPress={() => {postNewUser()}}/>
            <Button title={"Delete user"} onPress={() => {deleteUser()}}/>
            <Button title={"Update user"} onPress={() => {updateUser()}}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {display: "flex", justifyContent: "center", alignItems: "center"}
});

export default HomeScreen;