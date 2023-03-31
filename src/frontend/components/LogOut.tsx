import {Auth} from "aws-amplify";
import {Button, TouchableOpacity, View} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

function LogOut({style = {}, iconColor = "black"}) {
    return (
        <View style={[{padding: 5, borderRadius: 10}, style]}>
            <TouchableOpacity onPress={() => {Auth.signOut()}}>
                <FontAwesome5Icon color={iconColor} name={"sign-out-alt"} size={30} />
            </TouchableOpacity>
        </View>
    );
};

export default LogOut;