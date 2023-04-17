import {StyleSheet, Text, View} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import React from "react";
import ProductReportsList from "./ProductReportsList";

function ProductReports({productReports, myReportIndex, setMyReportIndex}) {
    return (
        <>
            {productReports && productReports?.length > 0
                ?
                <View style={styles.container}>
                    <View style={styles.hasBeenReported}>
                        <FontAwesome5 name={"exclamation-triangle"} color={"red"} size={20}/>
                        <Text style={{paddingLeft: 15}}>
                            <Text style={{fontWeight: "bold"}}>
                                Warning:
                            </Text> Product has been reported.
                        </Text>
                    </View>
                    <ProductReportsList productReports={productReports} setMyReportIndex={setMyReportIndex}/>
                </View>
                :
                <View style={styles.neverReported}>
                    <FontAwesome5 name={"check-circle"} color={"green"} size={20}/>
                    <Text style={{paddingLeft: 15}}>Product has never been reported.</Text>
                </View>
            }
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 5,
        borderBottomColor: "lightgrey",
        borderBottomWidth: 2
    },
    hasBeenReported: {
        marginTop: 20,
        flexDirection: "row",
        marginBottom: 5,
        borderTopColor: "lightgrey",
        borderBottomColor: "lightgrey",
        borderTopWidth: 2,
        borderBottomWidth: 2,
        padding: 15
    },
    neverReported: {
        marginTop: 20,
        flexDirection: "row",
        borderTopColor: "lightgrey",
        borderBottomColor: "lightgrey",
        borderTopWidth: 2,
        borderBottomWidth: 2,
        padding: 15
    }
})

export default ProductReports;