import {StyleSheet, Text, View} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import moment from "moment";
import React from "react";
import {useAppSelector} from "../../../hooks";

function ProductReportsListItem({report, setMyReportIndex}) {
    const username = useAppSelector(state => state.user.username);
    const userAllergens = [...useAppSelector(state => state.appData.accounts[username]?.allergens)];

    const getReportColor = (userAllergens, report) => {
        // color to clarify whether product is safe, containing user allergens, or only containing non-user allergens

        let flag = "orange";
        if (report?.user_id === username) {
            flag = "green";
        }
        else {
            report?.suspected_allergens.forEach((allergen)=>{
                if (userAllergens?.includes(allergen)) {
                    flag = "red";
                }
            });
        }
        return flag;
    }

    return (
        <View style={{...styles.container, backgroundColor: getReportColor(userAllergens, report.item)}}>
            <Text style={styles.userReportText}>
                {report.item.user_id === username ? "My Report:              " : "Reported allergens:"}
            </Text>

            <View style={{padding: 5, paddingBottom: 10}}>
                {/* Allergens specified in the report */}
                {[...report.item.suspected_allergens].map((allergen, index) => {
                    if ([...userAllergens].includes(allergen) && report.item.user_id !== username) {
                        return (
                            <Text key={index.toString()} style={styles.containsUserAllergenText}>
                                - {allergen}{"  "}
                                <FontAwesome5 name={"exclamation-triangle"} size={15} color={"white"}/>
                            </Text>
                        );
                    }
                    else {
                        if (report.item.user_id === username) {
                            setMyReportIndex(report.index);
                        }
                        return (
                            <Text key={index.toString()} style={styles.allergen}> - {allergen}</Text>
                        );
                    }
                })}
            </View>

            <Text style={styles.time}>
                {moment(report.item.date).fromNow()}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        paddingLeft: 5,
        paddingRight: 10,
        paddingBottom: 20,
        marginRight: 5
    },
    userReportText: {
        color: "white",
        paddingLeft: 5,
        paddingTop: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: "white"
    },
    containsUserAllergenText: {
        paddingLeft: "20%",
        color: "white",
        fontWeight: "bold"
    },
    allergen: {
        paddingLeft: "20%",
        color: "white"
    },
    time: {
        borderTopWidth: 0.5,
        borderTopColor: "white",
        color: "white",
        position: "absolute",
        bottom: 5,
        right: 5,
        alignSelf: "flex-end",
        fontSize: 12
    }
})

export default ProductReportsListItem;