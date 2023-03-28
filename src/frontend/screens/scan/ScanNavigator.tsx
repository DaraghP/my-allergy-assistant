import {StyleSheet} from "react-native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ScanResult from "./ScanResult";
import ScanScreen from "./ScanScreen";
import { useNavigation } from "@react-navigation/native";
import {HeaderBackButton} from '@react-navigation/elements';
import {useEffect, useState} from "react";

function ScanNavigator({route}) {
    const navigation = useNavigation();
    const Stack = createNativeStackNavigator();
    const [barcodeText, setBarcodeText] = useState<string>("");

    useEffect(() => {
        // console.log("scanmode", route.params?.scanMode, resultData);
        if (route.params?.data?.products == null && route.params?.scan == null) {
            navigation.navigate("ScanScreen")
        }
        else {
            navigation.navigate("ScanResult", {scan: route.params?.scan})
        }
        // console.log(route.params?.data?.products == null, route.params?.scan == null) //
    }, [route.params])

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={"ScanScreen"}
                options={{headerTitle: "Scan Product", headerTitleAlign: "center"}}
            >
                {(props) => (
                    <ScanScreen {...props} route={route} setBarcodeText={(text: string) => {setBarcodeText(text)}} barcodeText={barcodeText}/>
                )}
            </Stack.Screen>
            <Stack.Screen
                name={"ScanResult"}
                options={{ headerTitle: "Scan Result", headerTitleAlign: "center", headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                console.log("Back button pressed.");
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
                            }}
                        />
                    )
                }}
            >
                {(props) => (
                    <ScanResult {...props} />
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