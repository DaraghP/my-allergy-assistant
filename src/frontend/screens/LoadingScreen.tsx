import {View, Text, ActivityIndicator, TouchableOpacity, BackHandler, StyleSheet} from "react-native";
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

    // LoadingScreen can be used outside of a navigator so it may be null, e.g. login
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
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>{route?.params?.text == null ? "Loading...": route?.params?.text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        marginTop: 15,
        color: "black",
        fontSize: 25
    }
})

export default LoadingScreen;