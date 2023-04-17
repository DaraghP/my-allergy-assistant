import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import AllergySelectionList from "../components/AllergySelectionList";
import { useNavigation } from "@react-navigation/native";
import Accordion from "../components/Accordion";
import ProfileButton from "../components/profile/ProfileButton";
import ProfileModals from "../components/profile/ProfileModals";

// component for profile, allows changing allergy profile / selecting allergens, viewing scan history or deleting account
function ProfileScreen() {
    const navigation = useNavigation();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isAllergySelectionAccordionOpen, setIsAllergySelectionAccordionOpen] = useState<boolean>(false);

    return (
        <View style={{ backgroundColor: "#f0f6ff"}}>
            <Accordion
                headerStyle={styles.accordionHeader}
                headerTextStyle={{...styles.buttonText, ...styles.accordionHeaderText}}
                headerText={"Change Selected Allergies"}
                content={<AllergySelectionList onConfirm={() => {}}/>} collapsed={isAllergySelectionAccordionOpen}
                setCollapsed={setIsAllergySelectionAccordionOpen}
            />

            <ProfileButton
                icon={"history"}
                text={"Scan History"}
                onPress={() => {
                    navigation.navigate("ScanHistory");
                }}
            />

            <ProfileButton
                icon={"times-circle"}
                iconColor={"red"}
                text={"Delete Account"}
                onPress={() => {
                    setIsModalOpen(true);
                }}
            />

            <ProfileModals
                isDeleteAccountModalOpen={isModalOpen}
                setIsDeleteAccountModalOpen={setIsModalOpen}
            />

        </View>

    )
}

const styles = StyleSheet.create({
    buttonText: {
        color: "black",
        fontSize: 20,
        marginLeft: 15
    },
    accordionHeader: {
        paddingVertical: 15,
        paddingLeft: 20
    },
    accordionHeaderText: {
        marginLeft: 0
    }
})

export default ProfileScreen;