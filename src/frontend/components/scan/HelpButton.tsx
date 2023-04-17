import {StyleSheet, Text, TouchableOpacity} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

function HelpButton({navigation}) {
    return (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate("ScanHelp")
            }}
            style={styles.button}
        >
            <FontAwesome5 color={"rgba(61,61,61,0.2)"} solid={true} name={"question-circle"} size={20}/>
            <Text style={styles.text}>Help</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 5
    },
    text: {
        fontSize: 18,
        fontWeight: "200",
        justifyContent: "center",
        marginLeft: 5
    }
})

export default HelpButton;