import {Button, Dimensions, Image, SafeAreaView, Text, View} from "react-native";
import {setHasCompletedSetup} from "../../reducers/app-data-reducer";
import {useAppDispatch, useAppSelector} from "../../hooks";

function CompleteSetup({route, navigation}) {
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);

    return (
        <SafeAreaView style={{padding: 25, height: "auto", flex: 1, justifyContent: "center"}}>
            <Image
                style={{resizeMode: "cover", width: "100%", height: "25%"}}
                source={require("../../assets/maaLogo.png")}
            />

            <Text>Setup complete!</Text>
            <Text>Press the button below to get started :)</Text>

            <Button
                title={"Finish"}
                color={"red"}
                onPress={() => {
                    dispatch(setHasCompletedSetup(username));
                }}
            />

        </SafeAreaView>
    )
}

export default CompleteSetup;