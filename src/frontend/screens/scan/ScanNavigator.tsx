import {StyleSheet} from "react-native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ScanResult from "./ScanResult";
import ScanScreen from "./ScanScreen";
import ScanHistory from "./ScanHistory";
import { useNavigation } from "@react-navigation/native";
import {HeaderBackButton} from '@react-navigation/elements';
import {useState} from "react";

function ScanNavigator() {
    const navigation = useNavigation();
    const Stack = createNativeStackNavigator();
    const [barcodeText, setBarcodeText] = useState<string>("");

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={"ScanScreen"}
                options={{headerTitle: "Scan Barcode", headerTitleAlign: "center"}}
            >
                {(props) => (
                    <ScanScreen {...props} navigation={navigation} setBarcodeText={(text: string) => {setBarcodeText(text)}} barcodeText={barcodeText}/>
                )}
            </Stack.Screen>
            <Stack.Screen
                name={"ScanResult"}
                options={{ headerTitle: "Scan Result", headerTitleAlign: "center", headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                console.log("Back button pressed.");
                                navigation.goBack();
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