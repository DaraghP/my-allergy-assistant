import {Auth} from "aws-amplify";
import {Button, TouchableOpacity, View, Text, StyleSheet} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

function LogOut({style = {}, iconColor = "white"}) {
    return (
        <View style={style}>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => {Auth.signOut()}}>
                <FontAwesome5Icon style={styles.logoutIcon} color={iconColor} name={"sign-out-alt"} size={30} />
                <Text style={styles.logoutText}>
                    Logout 
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    logoutBtn: {
        flexDirection: "row",
        padding: 5,
        backgroundColor: "black",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    logoutIcon: {
        paddingRight: 5,
        marginLeft: 15
    },
    logoutText: {
        textAlign: "center",
        paddingHorizontal: 10,
        color: "white",
        marginVertical: "auto"
    }
})

export default LogOut;