import AppModal from "../../AppModal";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {MultipleSelectList} from "react-native-dropdown-select-list";
import {addReportToDynamo, Report} from "../../../api";
import React, {useState} from "react";
import {useAppSelector} from "../../../hooks";

function ReportModal({isReportModalOpen, setIsReportModalOpen, scan, productReports, setProductReports}) {
    const username = useAppSelector(state => state.user.username);
    const user = useAppSelector(state => state.appData.accounts[username]);
    const userAllergens = user.allergens;
    const [selectedList, setSelectedList] = useState([]);
    const [viewReportWarning, setViewReportWarning] = useState<boolean>(true);

    return (
        <AppModal
            isModalOpen={{state: isReportModalOpen, setState: (bool: boolean) => {setIsReportModalOpen(bool)}}}
            headerText={"Are you sure you want to report this product?"}
            modalContent={
                <>
                    {viewReportWarning ?
                        <>
                            <Text>
                                Only report products if it caused you to have an allergic reaction, and you have
                                consulted with a doctor to ensure you're not allergic to any of the listed
                                ingredients. {"\n\n"}This will notify all users who previously scanned this product's
                                barcode. {"\n\n"}A warning will also be displayed on the product page to warn future
                                scanners. {"\n\n"}If you are certain what caused your allergic reaction, please select
                                the allergen(s) from the dropdown list:
                            </Text>
                            <TouchableOpacity style={styles.specifyAllergens} onPress={() => {setViewReportWarning(false)}}>
                                <Text style={styles.specifyAllergensText}>Specify Allergens</Text>
                            </TouchableOpacity>
                        </>
                        :
                        <TouchableOpacity style={styles.goBackBtn} onPress={() => {setViewReportWarning(true)}}>
                            <Text style={styles.goBackBtnText}>Go Back...</Text>
                        </TouchableOpacity>
                    }
                    <View style={{flex: viewReportWarning ? 0 : 1, minWidth: "100%"}} onTouchStart={() => {setViewReportWarning(false)}}>
                        {!viewReportWarning &&
                            <ScrollView>
                                <MultipleSelectList
                                    style={{flex: 1}}
                                    label={'Allergens Chosen'}
                                    selected={selectedList}
                                    setSelected={(value) => setSelectedList(value)}
                                    data={user?.allergens}
                                    save="value"
                                    placeholder={"Reported Allergens"}
                                />
                            </ScrollView>
                        }
                    </View>
                </>
            }
            modalBtnsConfig={viewReportWarning && {
                option1: {
                    onPress: () => {
                        let reportObj : Report = {username: username, productName: scan?.product_display_name, productId: scan?.product_code, suspectedAllergens: selectedList.length == 0 ? userAllergens : selectedList}
                        addReportToDynamo(reportObj);

                        if (productReports) {
                            let tmpReports = productReports;
                            let newReport = {
                                user_id: username,
                                date: new Date(),
                                suspected_allergens: selectedList.length==0 ? userAllergens : selectedList
                            };
                            tmpReports.push(newReport);
                            setProductReports(tmpReports);
                        }
                        else {
                            setProductReports([{user_id: username, date: new Date(), suspected_allergens: selectedList.length == 0 ? userAllergens : selectedList}]);
                        }
                        setSelectedList([]);
                    },
                    text: "Yes - Report Product",
                },
                option2: {
                    onPress: () => {},
                    text: "No - Cancel",
                },
            }}

        />
    )
}


const styles = StyleSheet.create({
    specifyAllergens: {
        backgroundColor: "red",
        borderRadius: 50,
        padding: 10,
        marginVertical: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    specifyAllergensText: {
        color: "white"
    },
    goBackBtn: {
        marginBottom: 10,
        alignItems: "center"
    },
    goBackBtnText: {
        fontWeight: "300",
        fontSize: 25,
        color: "grey",
        textDecorationLine: "underline"
    }
})

export default ReportModal;