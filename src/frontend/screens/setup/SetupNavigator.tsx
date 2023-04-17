import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Setup from "./Setup";
import CompleteSetup from "./CompleteSetup";


// Navigator for first-time account setup: Setup, CompleteSetup
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
                options={{
                    headerTitle: "Setup",
                    headerTitleAlign: "center",
                }}
            >
                {(props) => (
                    <CompleteSetup {...props} />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

export default SetupNavigator;