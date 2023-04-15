import {BackHandler, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ScanResult from "./ScanResult";
import ScanScreen from "./ScanScreen";
import { useNavigation } from "@react-navigation/native";
import {HeaderBackButton} from '@react-navigation/elements';
import {useEffect, useState} from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import ScanHelp from "./ScanHelp";


function ScanNavigator({route}) {
    const navigation = useNavigation();
    const Stack = createNativeStackNavigator();
    const [barcodeText, setBarcodeText] = useState<string>("");

    const backPressHandler = () => {
        if (route.params?.data?.products !== undefined) {
            // if navigated to ScanResult through SearchScreen, then prevent ScanResult screen appearing when wanting to navigate to scanner
            navigation.navigate("ScanScreen");
            navigation.navigate("Search", {data: route.params?.data});
        }
        else if (route.params?.returnTo) {
            navigation.navigate("ScanScreen");
            navigation.navigate(route.params?.returnTo);
        }
        else {
            navigation.navigate("ScanScreen");
        }
        setBarcodeText("");
    }

    useEffect(() => {
        if (route.params?.data?.products == null && route.params?.scan == null) {
            navigation.navigate("ScanScreen")
        }
        else {
            navigation.navigate("ScanResult", {scan: route.params?.scan})
        }
    }, [route.params])

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={"ScanScreen"}
                options={{
                    headerTitle: "Scan Product",
                    headerTitleAlign: "center",
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {navigation.navigate("ScanHelp")}} style={{flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: 5}}>
                            <FontAwesome5 color={"rgba(61,61,61,0.2)"} solid={true} name={"question-circle"} size={20}/>
                            <Text style={{fontSize: 18, fontWeight: "200", justifyContent: "center", marginLeft: 5}}>Help</Text>
                        </TouchableOpacity>
                    )
                }}
            >
                {(props) => (
                    <ScanScreen {...props} route={route} setBarcodeText={(text: string) => {setBarcodeText(text)}} barcodeText={barcodeText}/>
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

const styles = StyleSheet.create({
    title: {
        marginBottom: 10,
        fontSize: 25,
        fontWeight: "900"
    },
    subheading: {
        marginBottom: 5,
        fontWeight: "800"
    }
});

export default ScanNavigator;