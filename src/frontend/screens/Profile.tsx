import React, {useEffect, useState} from "react";
import {Modal, Alert, TouchableOpacity, Button, StyleSheet, Text, View} from "react-native";
import {Auth} from "aws-amplify";
import AllergySelectionList from "../components/AllergySelectionList";
import {deleteUser} from "../api"
import {useAppDispatch, useAppSelector} from "../hooks";
import { deleteAccount } from "../reducers/app-data-reducer";
import AppModal from "../components/AppModal";
import { useNavigation } from "@react-navigation/native";
import Accordion from "../components/Accordion";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
// import { BlurView } from "@react-native-community/blur";

function ProfileScreen() {// s
    const navigation = useNavigation();
    let dispatch = useAppDispatch();
    let user = useAppSelector(state => state.user);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isAllergySelectionAccordionOpen, setIsAllergySelectionAccordionOpen] = useState<boolean>(false);

    return (
        <>
            <View>
                <Accordion
                    headerStyle={{paddingVertical: 15}}
                    headerTextStyle={{...styles.buttonText, marginLeft: 0}}
                    headerText={"Change Selected Allergies"}
                    content={<AllergySelectionList onConfirm={() => {}}/>} collapsed={isAllergySelectionAccordionOpen}
                    setCollapsed={setIsAllergySelectionAccordionOpen}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        navigation.navigate("ScanHistory");
                    }}
                >
                    <FontAwesome5Icon name={"history"} size={25}/>
                    <Text style={styles.buttonText}>Scan History</Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        setIsModalOpen(true);
                    }}
                >
                    <FontAwesome5Icon color={"red"} name={"times-circle"} size={25}/>
                    <Text style={styles.buttonText}>Delete Account</Text>
                </TouchableOpacity>

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

            </View>
        </>
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
    },
    buttonText: {
        color: "black",
        fontSize: 20,
        marginLeft: 15
    },
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