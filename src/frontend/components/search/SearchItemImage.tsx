import {Dimensions, Image, StyleSheet, Text, View} from "react-native";

const {height, width} = Dimensions.get("window");
function SearchItemImage({imageUrl}) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {imageUrl != null &&
                    <Image style={styles.image} source={{uri: imageUrl}}/>
                }
                {imageUrl == null &&
                    <Text style={styles.noImage}>No Image Available</Text>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: height * 0.18,
        alignSelf: "center",
        marginRight: 10,
        borderWidth: 10,
        borderColor: "#f1f1f1",
        backgroundColor: "#f1f1f1",
        borderRadius: 10
    },
    content: {
        width: width * 0.18,
        height: height * 0.15,
        justifyContent: "center"
    },
    image: {
        resizeMode: "contain",
        flex: 1,
        alignItems: "center",
        borderRadius: 0
    },
    noImage: {
        fontWeight: "200",
        alignSelf: "center",
        textAlign: "center"
    }
})

export default SearchItemImage;