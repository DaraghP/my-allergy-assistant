import {View, Text, ActivityIndicator} from "react-native";

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
        </View>
    )
}

export default LoadingScreen;