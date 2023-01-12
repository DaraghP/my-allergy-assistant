import {StyleSheet} from "react-native";

import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Setup from "./Setup";
import CompleteSetup from "./CompleteSetup";

function SetupNavigator() {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={"Setup"}
                options={{headerTitleAlign: "center"}}
            >
                {(props) => (
                    <Setup {...props} />
                )}
            </Stack.Screen>
            <Stack.Screen
                name={"CompleteSetup"}
                options={{headerTitle: "Setup", headerTitleAlign: "center"}}
            >
                {(props) => (
                    <CompleteSetup {...props} />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 10,
        fontSize: 25,
        fontWeight: "900"
    },
    subheading: {
        marginBottom: 5,
        fontWeight: "800"
    },
    confirmBtn: {
        paddingTop: 10,
    }
});

export default SetupNavigator;