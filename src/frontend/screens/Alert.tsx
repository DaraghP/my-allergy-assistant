import { useAppDispatch, useAppSelector } from "../hooks";
import { FlatList, SafeAreaView, View, TouchableNativeFeedback, Text, StyleSheet} from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useEffect} from "react";

function AlertScreen() {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username].notifications);

    useEffect(() => {
        console.log("Alerts!", notifications)
    }, [notifications])

    return (
        <SafeAreaView style={{flex: 1}}>
            <FlatList
                    style={{
                        flex: 1,
                        borderRadius: 1,
                        borderWidth: 0.5,
                        borderColor: "grey",
                        height: "100%"
                    }}
                    data={notifications}
                    keyExtractor={alert => alert.productID}
                    renderItem={(alert) => (
                        <TouchableNativeFeedback onPress={() => {
                            console.log("notification ", alert);
                        }}>
                            <View style={styles.item}>
                                <View style={{flexDirection: "column", flexShrink: 1}}>
                                    <Text style={{marginTop: 5, fontWeight: "bold"}}>Product Reported</Text>
                                    <Text style={{flex: 1, flexWrap: "wrap", marginTop: 5, textTransform: "capitalize"}}>{alert?.item.productName}</Text>
                                    <View style={{flexDirection: "row", alignItems: "center",}}>
                                        <FontAwesome5 style={{marginRight: 5}} name="eye" size={25}/>
                                        <Text>View for more information</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    item: {
        width: "100%",
        flex: 1,
        flexDirection: "row",
        padding: 10,
        backgroundColor: "white",
        marginBottom: 1,
        borderColor: "lightgrey",
        borderWidth: 0.25
    }
})

export default AlertScreen;