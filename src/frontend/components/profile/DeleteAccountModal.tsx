import AppModal from "../AppModal";
import {deleteUser} from "../../api";
import {deleteAccount} from "../../reducers/app-data-reducer";
import {Auth} from "aws-amplify";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../hooks";

function DeleteAccountModal({isModalOpen, setIsModalOpen}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user);

    return (
        <AppModal
            isModalOpen={{state: isModalOpen, setState: (bool: boolean) => {setIsModalOpen(bool)}}}
            headerText={"Delete Account"}
            modalContentText={"Are you sure you want to delete your account?"}
            modalBtnsConfig={{
                option1: {
                    onPress: () => {
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
                    text: "Cancel",
                }
            }}
        />
    )
}

export default DeleteAccountModal;