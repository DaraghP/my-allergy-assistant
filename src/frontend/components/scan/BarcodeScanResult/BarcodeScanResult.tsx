import React, {useEffect, useState} from "react";
import {Dimensions, ScrollView, Text, View, TouchableOpacity, Linking, FlatList, StyleSheet} from "react-native";
import {useAppSelector, useAppDispatch} from "../../../hooks";
import {
    getProductReports,
    updateUser,
    addNotificationsToDynamo,
    deleteNotificationsFromDynamo,
    UpdatableNotificationObj,
} from "../../../api";
import {updateProductNotificationStatus} from "../../../reducers/app-data-reducer";
import _ from "lodash";
import BarcodeScanResultModals from "./BarcodeScanResultModals";
import IngredientsAllergensTracesText from "./IngredientsAllergensTracesText";
import ProductReports from "./ProductReports";
import ReceiveProductNotifications from "../../scan/ReceiveProductNotifications";
import ReportButtons from "./ReportButtons";
import SafetyResult from "../SafetyResult";
import AllergenListedAsTable from "../AllergenListedAsTable";


// Used by ScanResult, for barcode scans
function BarcodeScanResult() {
    const dispatch = useAppDispatch();
    const scan = useAppSelector(state => state.ui.scanResult).scan;
    const username = useAppSelector(state => state.user.username);
    const email = useAppSelector(state => state.user.email);
    const usersScanHistory = useAppSelector(state => state.appData.accounts[username]?.scans);
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint);
    const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
    const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState<boolean>(false);
    const [myReportIndex, setMyReportIndex] = useState(-1);
    const [productReports, setProductReports] = useState(undefined);
    const [allergensIdentified, setAllergensIdentified] = useState({userAllergens: [], listedAs: {}})
    const [determined, setIsDetermined] = useState(false);

    useEffect(() => {
        setIsDetermined(false)
        setAllergensIdentified({userAllergens: [], listedAs: {}})
        // get the product reports, we will use to display later and see if any contaim user allergens
        if (scan?.product_code) {
            getProductReports({productId: scan?.product_code}).then((res) => {
                if (res.Item){
                    if (!(_.isEqual(productReports, res.Item?.reports))){
                        setProductReports(res.Item?.reports);
                    }
                } else {
                    setProductReports([]);
                }
            })

            // notifications are turned on by default (unless already off)
            if (usersScanHistory[scan.product_code].receive_notifications !== false) {
                notificationStateHandler(0);
            }
        }
    }, [scan])

    const notificationStateHandler = (val) => {
        let bool = val == 0;

        let notifyObj : UpdatableNotificationObj = {productId: scan?.product_code, user_endpoint: deviceEndpoint}

        if (bool) {
            // add user_endpoint to notifications table in DynamoDB
            addNotificationsToDynamo(notifyObj);
        }
        else {
            // remove user_endpoint from notifications table in DynamoDB
            deleteNotificationsFromDynamo(notifyObj);
        }

        updateUser({username: username, deviceEndpoint: deviceEndpoint, email: email, product_id: scan?.product_code, receive_notifications: bool})
        dispatch(updateProductNotificationStatus({username: username, product_id: scan?.product_code, product_notifications_boolean: bool}))
    }

    return (
        <>
            <SafetyResult
                style={{}}
                userAllergensFound={allergensIdentified?.userAllergens ?? []}
                userMayContain={[]}
                determined={determined}
            />

            <Text style={styles.productName}>
                {scan?.product_display_name}
            </Text>

            <View style={styles.container}>
                <IngredientsAllergensTracesText
                    scan={scan}
                    setSafetyResult={(res) => {
                        setAllergensIdentified(res);
                        setIsDetermined(true);
                    }}
                />

                {Object.entries(allergensIdentified?.listedAs).length !== 0 &&
                    <View style={styles.listedAsContainer}>
                        <AllergenListedAsTable
                            listedAs={allergensIdentified?.listedAs}
                        />
                    </View>
                }
                <ProductReports
                    productReports={productReports}
                    myReportIndex={myReportIndex}
                    setMyReportIndex={setMyReportIndex}
                />

                <View style={{alignItems: "center"}}>
                    <Text style={{paddingTop: 20, paddingBottom: 10}}>Receive notifications if product is reported?</Text>
                    <ReceiveProductNotifications
                        style={{width: "75%"}}
                        onPress={notificationStateHandler}
                        productId={scan?.product_code}
                        scans={usersScanHistory}
                    />
                </View>

                <View style={{marginVertical: 25, alignItems: "center"}}>
                    <ReportButtons
                        setIsReportModalOpen={setIsReportModalOpen}
                        setIsDeleteReportModalOpen={setIsDeleteReportModalOpen}
                        myReportIndex={myReportIndex}
                    />
                </View>

                <BarcodeScanResultModals
                    scan={scan}
                    productReports={productReports}
                    setProductReports={setProductReports}
                    isReportModalOpen={isReportModalOpen}
                    setIsReportModalOpen={setIsReportModalOpen}
                    myReportIndex={myReportIndex}
                    setMyReportIndex={setMyReportIndex}
                    isDeleteReportModalOpen={isDeleteReportModalOpen}
                    setIsDeleteReportModalOpen={setIsDeleteReportModalOpen}
                />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        marginLeft: 20,
        paddingRight: 20
    },
    productName: {
        fontSize: 30,
        fontWeight: 'bold',
        margin: '3.5%',
        flexWrap: "wrap",
        textAlign: 'center'
    },
    listedAsContainer: {
        marginTop: 10
    },
})

export default BarcodeScanResult;