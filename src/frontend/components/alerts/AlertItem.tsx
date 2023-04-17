import {StyleSheet, TouchableNativeFeedback, View} from "react-native";
import {openNotification} from "../../reducers/app-data-reducer";
import {scanBarcode} from "../../api";
import {updateLoadingState, updateScanMode, updateScanResult} from "../../reducers/ui-reducer";
import {useAppDispatch, useAppSelector} from "../../hooks";
import AlertReportSubmitted from "./AlertReportSubmitted";
import AlertReportRetrieved from "./AlertReportRetrieved";


function AlertItem({navigation, alert}) {
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);

    return (
        <TouchableNativeFeedback
            key={alert.index}
            style={styles.alertContainer}
            onPress={async () => {
                dispatch(openNotification({username: username, productID: alert.item.productID}));
                navigation.navigate("Loading", {text: "Scanning..."});
                try {
                    let scan = await scanBarcode(alert.item.productID);
                    dispatch(updateScanResult({scan: scan}));
                    navigation.navigate("Scan", {scan: scan, returnTo: "Alerts"});
                }
                catch (e) {
                    dispatch(updateLoadingState(false));
                }
            }}
        >
            <View style={styles.item}>
                {alert.item.reporterID === username
                    ?
                    <AlertReportSubmitted alert={alert}/>
                    :
                    <AlertReportRetrieved alert={alert}/>
                }

                {!alert.item.isOpened &&
                    <View style={{...styles.redDot}}/>
                }
            </View>
        </TouchableNativeFeedback>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f6ff"
    },
    alertContainer: {
        borderBottomColor: "black",
        borderBottomWidth: 5
    },
    item: {
        width: "100%",
        flex: 1,
        // flexDirection: "row",
        padding: 10,
        backgroundColor: "white",
        marginBottom: 1,
        borderBottomColor: "lightgrey",
        borderBottomWidth: 3,
        borderRadius: 25
    },
    noAlerts: {
        fontSize: 25,
        color: "black",
        alignSelf: "center",
        padding: 20
    },
    redDot: {
        position: "absolute",
        alignSelf: "flex-end",
        borderRadius: 20,
        backgroundColor: "red",
        height: 10,
        width: 10,
        right: 50,
        top: "50%",
        bottom: "50%"
        // height: "auto"
    }
})

export default AlertItem;