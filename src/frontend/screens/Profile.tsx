import React, {useEffect, useState} from "react";
import {Modal, Alert, TouchableOpacity, Button, StyleSheet, Text, View} from "react-native";
import {Auth} from "aws-amplify";
import AllergySelectionList from "../components/AllergySelectionList";
import {deleteUser} from "../api"
import {useAppDispatch, useAppSelector} from "../hooks";
import { deleteAccount } from "../reducers/app-data-reducer";
import AppModal from "../components/AppModal";
// import { BlurView } from "@react-native-community/blur";

function ProfileScreen() {
    let dispatch = useAppDispatch();
    let user = useAppSelector(state => state.user);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

            {/* TODO: Decide if this needs an accordion*/}
            <View style={{flex: 1, padding: 5}}>
                <Text style={styles.heading}>Change your allergies</Text>
                <AllergySelectionList onConfirm={confirmAllergens}/>

                <Text>{"\n\n"}</Text>
                <Button
                    title={"Delete account"}
                    onPress={() => {
                        setIsModalOpen(true);
                        console.log("deleting account!")
                    }}
                />

                {/* <BlurView> */}
                <AppModal
                    isModalOpen={{state: isModalOpen, setState: (bool: boolean) => {setIsModalOpen(bool)}}}
                    headerText={"Delete Account"}
                    modalContentText={"Are you sure you want to delete your account?"}
                    modalBtnsConfig={{
                        option1: {
                            onPress: () => {
                                console.log("Yes pressed.");

                                // delete user from dynamoDB, delete account in app data, and log out
                                deleteUser({username: user.username, email: user.email});

                                // delete user data from redux
                                dispatch(deleteAccount(user.username));
                                // delete their account in cognito
                                Auth.deleteUser();
                            },
                            text: "Yes - Delete Account"
                        },
                        option2: {
                            onPress: () => {
                                console.log("No pressed.")
                            },
                            text: "No - Cancel",
                        }
                    }}
                />
                {/* </BlurView> */}

                <Text>{"\n\n"}</Text>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginVertical: "50%",
        marginHorizontal: 5,
        backgroundColor: "white",
        borderWidth: 0.5,
        borderRadius: 10
    },
    modalHeader: {
        padding: 5,
        paddingLeft: 10,
        color: "black",
        fontSize: 22,
        borderBottomWidth: 0.5
    },
    modalContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    modalBtnsContainer: {
        flexGrow: 0,
        // width: "100%",
        justifyContent: "center",
        flexDirection: "row"
    },
    modalBtn: {
      flex: 1,
      justifyContent: "center",
      borderWidth: 1,
      borderRadius: 5,
      marginTop: 5,
      marginHorizontal: 5,
      padding: 5,
      minWidth: "35%",
      maxWidth: "45%"
    },
    modalBtnText: {
      textAlign: "center"
    }
})

export default ProfileScreen;