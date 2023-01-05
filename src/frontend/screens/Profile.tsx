import React, {useEffect, useState} from "react";
import {Button} from "react-native";
import {Auth} from "aws-amplify";

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

    return (
        <LogOut/>
    )
}

export default ProfileScreen;