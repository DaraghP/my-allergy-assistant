import React, {useEffect, useState} from "react";
import {Modal, Alert, TouchableOpacity, Button, StyleSheet, Text, View} from "react-native";
import {Auth} from "aws-amplify";
import AllergySelectionList from "../components/AllergySelectionList";
import {deleteUser} from "../api.ts"
import {useAppSelector} from "../hooks";

function ProfileScreen() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    let user = useAppSelector(state => state.user);

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
                        // Alert.alert(
                        //     "Are you sure you want to delete your account?",
                        //     "This action is permanent and cannot be undone.",
                        //     [
                        //         {
                        //             text: "No - Cancel",
                        //         },
                        //         {
                        //             text: "Yes - Delete Account",
                        //             onPress: () => console.log("account deleting."),
                        //         },
                        //     ],
                        //         {cancelable: true}
                        // )
                    }}
                />

                <Modal style={styles.modal} animationType="slide" visible={isModalOpen} onRequestClose={() => {setIsModalOpen(!isModalOpen)}}>
                    <Text style={styles.heading}>Are you sure you want to delete your account?</Text>

                    <View style={styles.modalBtnsContainer}>
                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={() => {
                                console.log("Yes pressed.");
                                // delete user from dynamoDB, delete account in app data, and log out
                                deleteUser({username: user.username, email: user.email});
                                // TODO: clear user data in redux before account deletion

                                // and also delete their account in cognito
                                Auth.deleteUser();
                                setIsModalOpen(false);
                            }}
                        >
                            <Text style={styles.modalBtnText}>Yes - Delete Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={() => {
                                console.log("No pressed.")
                                setIsModalOpen(false);
                            }}
                        >
                            <Text style={styles.modalBtnText}>No - Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                <Text>{"\n\n"}</Text>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 22
    },
    modalBtnsContainer: {
        flexGrow: 0,
        // width: "100%",
        justifyContent: "center",
        flexDirection: "row"
    },
    modalBtn: {
      borderWidth: 1,
      borderRadius: 5,
      marginHorizontal: 5,
      padding: 5,
      minWidth: "25%"
    },
    modalBtnText: {
      textAlign: "center"
    },
    heading: {
        color: "black",
        fontSize: 25,
        fontWeight: "900",
        marginVertical: 10,
        textAlign: "center"
    }
})

export default ProfileScreen;