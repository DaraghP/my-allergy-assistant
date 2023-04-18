import {BackHandler, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ScanResult from "./ScanResult";
import ScanScreen from "./ScanScreen";
import { useNavigation } from "@react-navigation/native";
import {HeaderBackButton} from '@react-navigation/elements';
import {useEffect} from "react";
import ScanHelp from "./ScanHelp";
import HelpButton from "../../components/scan/HelpButton";
import {useAppSelector} from "../../hooks";


// Navigator used from scan tab: ScanResult, ScanHistory, ScanHelp
function ScanNavigator({route}) {
    const scan = useAppSelector(state => state.ui.scanResult);
    const navigation = useNavigation();
    const Stack = createNativeStackNavigator();

    const backPressHandler = () => {
        if (route.params?.data?.products !== undefined) {
            // if navigated to ScanResult through SearchScreen, then prevent ScanResult screen appearing when wanting to navigate to scanner
            navigation.navigate("ScanScreen");
            navigation.navigate("Search", {data: route.params?.data});
        }
        else if (route.params?.returnTo) {
            navigation.navigate("ScanScreen");
            navigation.navigate(route.params?.returnTo);
            route.params.returnTo = null;
        }
        else {
            navigation.navigate("ScanScreen");
        }
    }

    useEffect(() => {
        if (route.params?.data?.products == null && Object.keys(scan).length < 1) {
            navigation.navigate("ScanScreen")
        }
        else {
            navigation.navigate("ScanResult")
        }
    }, [route.params])

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={"ScanScreen"}
                options={{
                    headerTitle: "Scan Product",
                    headerTitleAlign: "center",
                    headerRight: () => <HelpButton navigation={navigation}/>
                }}
            >
                {(props) => (
                    <ScanScreen {...props} route={route}/>
                )}
            </Stack.Screen>

            <Stack.Screen
                name={"ScanResult"}
                options={{
                    headerTitle: "Scan Result",
                    headerTitleAlign: "center",
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={backPressHandler}
                        />
                    )
                }}
            >
                {(props) => (
                    <ScanResult {...props} backPressHandler={backPressHandler}/>
                )}
            </Stack.Screen>

            <Stack.Screen
                name={"ScanHelp"}
                options={{
                    headerTitle: "Help",
                    headerTitleAlign: "center",
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={backPressHandler}
                        />
                    )
                }}
            >
                {(props) => (
                    <ScanHelp {...props}/>
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

export default ScanNavigator;