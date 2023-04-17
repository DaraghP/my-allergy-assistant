import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import React from "react";

function ReportButtons({setIsReportModalOpen, setIsDeleteReportModalOpen, myReportIndex}) {
    return (
        <>
            <Text style={{maxWidth: "75%"}}>Missing allergens?</Text><Text>Issue a report and let others know.</Text>
            {myReportIndex === -1
                ?
                <TouchableOpacity
                    style={styles.reportProductBtn}
                    onPress={() => {
                        setIsReportModalOpen(true);
                    }}
                >
                    <FontAwesome5 color={"white"} name={"flag-checkered"} size={25}/>
                    <Text style={styles.btnText}>Report product</Text>
                </TouchableOpacity>
                :
                <View style={{flexDirection: "row"}}>
                    {/* Report Submitted */}
                    <TouchableOpacity
                        style={styles.reportSubmitted}
                        disabled={true}
                    >
                        <FontAwesome5 color={"white"} name={"check-circle"} size={25}/>
                        <Text style={styles.btnText}>Report submitted</Text>
                    </TouchableOpacity>

                    {/* Delete Report*/}
                    <TouchableOpacity
                        style={styles.deleteReportBtn}
                        onPress={() => {
                            setIsDeleteReportModalOpen(true);
                        }}
                    >
                        <FontAwesome5 color={"white"} name={"trash-alt"} size={25}/>
                        <Text style={styles.btnText}>Delete Report</Text>
                    </TouchableOpacity>
                </View>
            }

        </>
    )
}

const styles = StyleSheet.create({
    reportProductBtn: {
        maxWidth: "50%",
        marginTop: 10,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red",
        borderRadius: 10,
        borderWidth: 0.5,
        flexDirection: "row"
    },
    reportSubmitted: {
        maxWidth: "50%",
        marginTop: 10,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "green",
        borderRadius: 10,
        borderWidth: 0.5,
        flexDirection: "row"
    },
    deleteReportBtn: {
        elevation: 5,
        marginLeft: 15,
        maxWidth: "50%",
        marginTop: 10,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red",
        borderRadius: 10,
        borderWidth: 0.5,
        flexDirection: "row"
    },
    btnText: {
        color: "white",
        paddingLeft: 20
    }
})

export default ReportButtons;