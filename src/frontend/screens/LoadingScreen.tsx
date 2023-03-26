import {View, Text, ActivityIndicator} from "react-native";

function LoadingScreen({navigation, route}) {
    console.log(route.params)
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ActivityIndicator size="large" />
            <Text style={{marginTop: 15, color: "black", fontSize: 25}}>{route.params?.text == null ? "Loading...": route.params?.text}</Text>
        </View>
    )
}

export default LoadingScreen;