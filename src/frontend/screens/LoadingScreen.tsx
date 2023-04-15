import {View, Text, ActivityIndicator, TouchableOpacity, BackHandler} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import {useIsFocused} from "@react-navigation/native";
import {useEffect} from "react";
import {useAppDispatch} from "../hooks";
import {updateLoadingState} from "../reducers/ui-reducer";

interface LoadingScreenProps {
    navigation?: any,
    route?: any
}

function LoadingScreen({navigation, route}: LoadingScreenProps) {
    const dispatch = useAppDispatch();

    // LoadingScreen can be used outside of a navigator, e.g. login
    const isFocused = navigation ? useIsFocused() : null;

    useEffect(() => {
        try {
            if (isFocused) {
                dispatch(updateLoadingState(true));
                const backHandler = BackHandler.addEventListener(
                  "hardwareBackPress",
                  () => {
                      return true;
                  }
                );

                return () => {backHandler.remove()};
            }
            else {
                dispatch(updateLoadingState(false));
            }
        }
        catch (ignored) {}
    }, [isFocused]);

    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ActivityIndicator size="large" />
            <Text style={{marginTop: 15, color: "black", fontSize: 25}}>{route?.params?.text == null ? "Loading...": route?.params?.text}</Text>
        </View>
    )
}

export default LoadingScreen;