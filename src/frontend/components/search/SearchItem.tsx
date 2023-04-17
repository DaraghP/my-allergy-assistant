import {Dimensions, Image, StyleSheet, Text, TouchableNativeFeedback, View} from "react-native";
import {storeScan} from "../scan/Scanner";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {useAppDispatch, useAppSelector} from "../../hooks";
import {StackActions, useNavigation} from "@react-navigation/native";
import SearchItemImage from "./SearchItemImage";
import {updateScanResult} from "../../reducers/ui-reducer";

function SearchItem({navigation, product, data}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user);
    const scans = useAppSelector(state => state.appData.accounts[user.username]?.scans);

    return (
        <TouchableNativeFeedback onPress={() => {
            storeScan(product.item.barcode, product.item.productResults, scans, dispatch, user);
            dispatch(updateScanResult({scan: product.item.productResults,}));
            navigation.navigate("Scan", { data: data })
        }}>
            <View style={styles.item}>
                <SearchItemImage imageUrl={product.item.image_url}/>
                <View style={styles.content}>
                    <Text style={styles.productName}>{product.item.product_display_name}</Text>
                    <View style={styles.view}>
                        <FontAwesome5 style={styles.viewIcon} name="eye" size={25}/>
                        <Text>View for more information</Text>
                    </View>
                </View>
            </View>
        </TouchableNativeFeedback>

    )
}

const styles = StyleSheet.create({
    content: {
        flexDirection: "column",
        flexShrink: 1
    },
    view: {
        flexDirection: "row",
        alignItems: "center",
    },
    viewIcon: {
        marginRight: 5
    },
    productName: {
        flex: 1,
        flexWrap: "wrap",
        marginTop: 25,
        textTransform: "capitalize",
        fontWeight: "bold"
    },
    item: {
        width: "100%",
        flex: 1,
        flexDirection: "row",
        padding: 10,
        backgroundColor: "white",
        marginBottom: 1,
        borderColor: "lightgrey",
        borderWidth: 0.25
    },
})

export default SearchItem;