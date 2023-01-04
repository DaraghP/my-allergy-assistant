import {Button, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {useAuthenticator} from "@aws-amplify/ui-react-native";
import {Auth} from "aws-amplify";
// https://github.com/aws-amplify/amplify-ui/issues/3184
// 
//
function HomeScreen() {
    const { user, signOut } = useAuthenticator(context => [context.user]);
    const [email, setEmail] = useState('');//
    const LogOut = () => {

        return (
            <Button
                color={'red'}
                title={'Log out'}
                onPress={() => {
                    console.log("signout pressed");
                    signOut();
                    setEmail('');
                }}
            />
        );
    };

    useEffect(() => {
        console.log('User has changed.');
    }, [Auth]);

    useEffect(() => {
        //setUserDetails(Auth.currentUserInfo());
        // let userDetails = Auth.currentUserInfo();
        // let authUserDetails = Auth.currentAuthenticatedUser({bypassCache: true})
        // console.log(Auth.user);
        if (Auth.user != null) {
            console.log('authUser', Auth.user.attributes.email);
            setEmail(Auth.user.attributes?.email);
        } else {
            setEmail('');//sd
        }
    }, [Auth.user]);

    return (
        <View>
            <Text>MyAllergyAssistant</Text>
            <LogOut />
            <Text>{email}</Text>
            {/*<Text>Hello {user.username}</Text>*/}
        </View>
    );
}

export default HomeScreen;