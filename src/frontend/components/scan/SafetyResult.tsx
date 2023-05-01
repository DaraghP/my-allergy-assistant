import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {ActivityIndicator, StyleSheet, Text, View} from "react-native";
import React from "react";

function SafetyResult({style={}, userAllergensFound, userMayContain, determined = true, ingredientsUnavailable = false, productReports = [], isBarcodeResult=false}) {
    return (
        // orange only if previously was going to be green, but with reportContainingAllergen 
        <View style={{...style, ...styles.container, borderBottomColor: determined ? (userAllergensFound.length > 0 ? "red" : ((productReports.length == 0 && !ingredientsUnavailable) ? "green" : "orange")) : "lightgrey"}}>

            {!determined &&
                <>
                    <ActivityIndicator size={"large"}/>
                    <Text style={styles.answerText}>Analysing...</Text>
                </>
            }

            {determined && userAllergensFound?.length == 0 && userMayContain?.length == 0 &&
                <>
                    {(productReports.length == 0 && !ingredientsUnavailable) &&
                        <>
                            <FontAwesome5 color={"green"} style={{marginBottom: 10}} name="check-circle" size={100}/>
                            <Text style={styles.answerText}>Safe to eat</Text>
                            <Text style={{fontWeight: "200"}}>For assistance only, always verify your result</Text>
                        </>
                    }
                    
                    {(productReports.length > 0 || ingredientsUnavailable) &&
                        <>
                            <FontAwesome5 color={"orange"} style={{marginBottom: 10}} name="exclamation-triangle" size={100}/>
                            <Text style={styles.answerText}>May not be safe to eat</Text>
                            
                            {ingredientsUnavailable && <Text style={{fontWeight: "200"}}>Ingredients unavailable</Text>}

                            {productReports.length > 0 && <Text style={{fontWeight: "200"}}>Product has been previously reported</Text>}
                        </>
                    }
                </>
           
            }

            {determined && userAllergensFound?.length > 0 &&
                <>
                    <FontAwesome5 color={"red"} style={{marginBottom: 10}} name="times-circle" size={100}/>
                    <Text style={styles.answerText}>Not safe to eat</Text>
                    {isBarcodeResult &&
                        <Text style={{fontWeight: "200"}}>See your detected allergens in the table below</Text>
                    }
                </>
            }

            {determined && userAllergensFound?.length == 0 && userMayContain?.length > 0 &&
                <>
                    <FontAwesome5 color={"red"} style={{marginBottom: 10}} name="exclamation-triangle" size={50}/>
                    <Text style={styles.answerText}>May not be safe to eat</Text>
                </>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 25,
        borderBottomWidth: 25,
    },
    answerText: {
        fontSize: 50,
        fontWeight: "800",
        color: "black"
    },
})

export default SafetyResult;