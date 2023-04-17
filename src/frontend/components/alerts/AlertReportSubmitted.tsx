import {StyleSheet, Text, View} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import moment from "moment";

function AlertReportSubmitted({alert}) {
    return (
        <>
            <View style={styles.container}>
                <Text style={{marginTop: 5}}>
                    <FontAwesome5 style={styles.icon}
                        color={"green"}
                        name={"check-circle"}
                        size={20}
                    />
                    {" "}
                    We received your report
                </Text>
                <Text style={{alignSelf: "flex-end", textAlign: "right"}}>{moment(alert.item.date).fromNow()}</Text>
            </View>

            <Text numberOfLines={1} style={styles.productName}>{alert?.item.productName}</Text>

            <Text>Users have been notified. Thanks for your help!</Text>
            <View style={styles.viewContainer}>
                <Text>View for more information{"  "}</Text>
                <FontAwesome5 style={styles.icon} name="info-circle" size={20}/>
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
    icon: {
        marginRight: 5
    },
    viewContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    productName: {
        fontWeight: "bold",
        flex: 1,
        flexWrap: "wrap",
        marginTop: 5,
        paddingRight: 50
    }
})

export default AlertReportSubmitted;