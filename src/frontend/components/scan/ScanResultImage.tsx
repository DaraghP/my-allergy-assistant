import {StyleSheet, Dimensions, Image, Text, View} from "react-native";
import {useAppSelector} from "../../hooks";

const {height, width} = Dimensions.get("window");
function ScanResultImage() {
    const scan = useAppSelector(state => state.ui.scanResult).scan;

    return (
        <View style={styles.container}>
            {scan?.product_image || scan?.ocrImage ?
                <Image
                    source={{uri: scan?.product_image || scan?.ocrImageOutput}}
                    style={styles.image}
                />
                :
                <Text style={styles.noImage}>No Image Available</Text>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width * 1,
        height: height * 0.35,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        padding: 15,
        borderBottomWidth: 0.5,
        borderColor: "grey"
    },
    image: {
        resizeMode: "contain",
        width: width * 1,
        height: height * 0.35,
        alignSelf: "center"
    },
    noImage: {
        fontWeight: "200",
        alignSelf: "center",
        textAlign: "center",
        fontSize: 25
    }
})

export default ScanResultImage;