import {View, Text, ActivityIndicator, TouchableOpacity} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

interface LoadingScreenProps {
    navigation?: any,
    route?: any
}

function LoadingScreen({navigation, route}: LoadingScreenProps) {
    console.log(route?.params)
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ActivityIndicator size="large" />
            <Text style={{marginTop: 15, color: "black", fontSize: 25}}>{route?.params?.text == null ? "Loading...": route?.params?.text}</Text>
            {/* {route?.params?.returnToScreen &&
                <TouchableOpacity onPress={navigation.navigate("Home")}>
                    <FontAwesome5Icon name={"check-circle"}/>
                </TouchableOpacity>
            } */}
        </View>
    )
}

export default LoadingScreen;