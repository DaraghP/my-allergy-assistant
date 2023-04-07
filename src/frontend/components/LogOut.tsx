import {Auth} from "aws-amplify";
import {Button, TouchableOpacity, View, Text} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

function LogOut({style = {}, iconColor = "white"}) {
    return (
        <View style={[{padding: 5, borderRadius: 10}, style]}>
            <TouchableOpacity style={{flexDirection: "row", padding: 5, backgroundColor: "black", borderRadius: 10, alignItems: "center", justifyContent: "center"}} onPress={() => {Auth.signOut()}}>
                
                <FontAwesome5Icon style={{paddingRight: 5, marginLeft: 15}} color={iconColor} name={"sign-out-alt"} size={30} />
                <Text style={{textAlign: "center", paddingHorizontal: 10, color: "white", marginVertical: "auto"}}>
                    Logout 
                </Text>
            </TouchableOpacity>
        </View>
    );
}; // 
// 
export default LogOut;