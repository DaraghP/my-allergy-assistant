import {StyleSheet, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {Auth} from "aws-amplify";

function HomeScreen() {
    const [email, setEmail] = useState('');

    useEffect(() => {
        Auth.currentAuthenticatedUser().then((user) => setEmail(user.attributes.email))
    }, [Auth]);

    return (
        <View style={styles.container}>
            <Text>MyAllergyAssistant HOMEPAGE</Text>
            <Text>{email}</Text>
            {/*<Text>Hello {user.username}</Text>*/}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {display: "flex", justifyContent: "center", alignItems: "center"}
});

export default HomeScreen;