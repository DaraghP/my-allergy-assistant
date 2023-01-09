import {Button, Dimensions, Image, SafeAreaView, Text, View} from "react-native";

function CompleteSetup({route, navigation, setOutput}) {

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
                    setOutput(false);
                }}
            />

        </SafeAreaView>
    )
}

export default CompleteSetup;