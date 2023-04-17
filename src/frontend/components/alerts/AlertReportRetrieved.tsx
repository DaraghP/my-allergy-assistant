import {StyleSheet, Text, View} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import moment from "moment";
import {useAppSelector} from "../../hooks";

function AlertReportRetrieved({alert}) {
    const userAllergens = useAppSelector(state => state.appData.accounts[state.user.username].allergens);

    const containsMatch = (listA, listB) => {
        if (listB) {
            let matchFound = false;
            listB.forEach((item) => {
                if (new Set(listA).has(item)) {
                    matchFound = true;
                }
            })
            return matchFound;
        }
    }

    return (
        <>
            <View style={styles.container}>
                <Text style={{marginTop: 5}}>
                    <FontAwesome5 style={styles.alertIcon}
                        color={containsMatch(userAllergens, alert.item.suspectedAllergens) ? "red" : "orange"}
                        name="exclamation-triangle"
                        size={20}
                    />
                    {"   "}
                    Product Reported
                </Text>

                <Text style={styles.date}>{moment(alert.item.date).fromNow()}</Text>
            </View>

            <Text numberOfLines={1} style={styles.productName}>{alert?.item.productName}</Text>
            <Text style={styles.suspectedAllergens}> Suspected to contain:{"  "}
                {alert?.item.suspectedAllergens.map((allergen, index) => {
                    if (new Set(userAllergens).has(allergen)){
                        return <Text key={index.toString()} style={{fontWeight: "bold"}}>{allergen}  </Text>
                    }
                    else {
                        return <Text key={index.toString()}>{allergen}  </Text>
                    }
                })}
            </Text>

            <View style={styles.view}>
                <Text>View for more information{"  "}</Text>
                <FontAwesome5 style={{marginRight: 5}} name="info-circle" size={20}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomColor: "lightgrey",
        borderBottomWidth: 1,
        paddingBottom: 5
    },
    alertIcon: {
        marginRight: 5
    },
    date: {
        alignSelf: "flex-end",
        textAlign: "right"
    },
    productName: {
        fontWeight: "bold",
        flex: 1,
        flexWrap: "wrap",
        marginTop: 5,
        textTransform: "capitalize",
        paddingRight: 50
    },
    suspectedAllergens: {
        flex: 1,
        flexWrap: "wrap",
        marginTop: 5
    },
    view: {
        flexDirection: "row",
        alignItems: "center",
    }
})

export default AlertReportRetrieved;