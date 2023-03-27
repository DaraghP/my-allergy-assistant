import { useAppDispatch, useAppSelector } from "../hooks";
import { FlatList, SafeAreaView, View, TouchableNativeFeedback, Text, StyleSheet} from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useEffect} from "react";
import { setAutoFreeze } from "immer";

function AlertScreen() {
    const dispatch = useAppDispatch();
    const userAllergens = useAppSelector(state => state.appData.accounts[state.user.username].allergens);//
    console.log("\n\nuserAllergens: "+ JSON.stringify(userAllergens));
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username].notifications);

    useEffect(() => {
        console.log("Alerts!", notifications)
    }, [notifications])

    const containsMatch = (listA, listB) => {
        if (listB) {
            console.log("listA: " + listA);
            console.log("listB: " + listB);
            let matchFound = false;
            listB.forEach((item) => {
                console.log("testing if " + item + " in listA");
                if (new Set(listA).has(item)){
                    console.log("MATCH: "+item);
                    matchFound = true;
                }
            })
            return matchFound;
        }
    }

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
                keyExtractor={alert => alert.productID+alert.reporterID}
                renderItem={(alert) => (
                    <TouchableNativeFeedback onPress={() => {
                        console.log("notification ", alert);
                    }}>
                        <View style={styles.item}>
                            <View style={{flexDirection: "column", flexShrink: 1}}>
                                
                                <Text style={{marginTop: 5, fontWeight: "bold"}}>
                                    <FontAwesome5 style={{marginRight: 5}}
                                        color={containsMatch(userAllergens, alert.item.suspectedAllergens) ? "red" : "orange"} 
                                        name="exclamation-triangle"
                                        size={20}/>{"   "}
                                    Product Reported</Text>
                                <Text style={{flex: 1, flexWrap: "wrap", marginTop: 5, textTransform: "capitalize"}}>{alert?.item.productName}</Text>
                                <Text style={{flex: 1, flexWrap: "wrap", marginTop: 5, textTransform: "capitalize"}}> Suspected to contain:{"  "}
                                    {alert?.item.suspectedAllergens.map((allergen, index) => {
                                        if (new Set(userAllergens).has(allergen)){
                                            return <Text style={{fontWeight: "bold"}}>{allergen}  </Text>
                                        } else {
                                            return <Text>{allergen}  </Text>
                                        }
                                    }
                                    )}
                                </Text>
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