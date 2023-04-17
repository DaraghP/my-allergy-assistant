import {SafeAreaView} from "react-native-safe-area-context";
import {Button, StyleSheet, Text, View} from "react-native";
import AllergySelectionList from "../../components/AllergySelectionList";

function Setup({route, navigation}) {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.importantText}>Before we get started, we need to set up your allergy profile first...</Text>
            <Text style={{...styles.subheading, marginTop: 30}}>Select your allergies, these can be changed later on</Text>
            <AllergySelectionList onConfirm={() => {navigation.navigate("CompleteSetup");}}/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 25,
        height: "auto",
        flex: 1
    },
    importantText: {
        color: "black",
        fontWeight: "900",
        fontSize: 15,
    },
    subheading: {
        marginBottom: 5,
        fontWeight: "800"
    },
    confirmBtn: {
        paddingTop: 10,
    }
});

export default Setup;