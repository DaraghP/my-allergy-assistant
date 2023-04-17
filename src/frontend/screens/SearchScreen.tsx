import {useRef, useState, useEffect} from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import SearchItem from "../components/search/SearchItem";
import Pagination from "../components/search/Pagination";


// Search screen for products that come off OFF (Open Food Facts)
function SearchScreen({navigation, route}) {
    const [data, setData] = useState(route.params?.data);
    const isFocused = useIsFocused();
    const scrollRef = useRef<FlatList>()

    useEffect(() => {
        if (isFocused && data.products.length > 0) {
            scrollRef.current?.scrollToIndex({index: 0, animated: false});
        }
    }, [isFocused])

    useEffect(() => {
        setData(route.params?.data);
    }, [route.params?.data])

    return (
        <SafeAreaView style={styles.container}>
            {data.products.length < 1 &&
                <Text style={styles.noProducts}>No Products Found.</Text>}

                {data.products &&
                    <FlatList
                        ref={scrollRef}
                        style={styles.list}
                        data={data?.products}
                        keyExtractor={product => product.barcode}
                        renderItem={(product) => <SearchItem navigation={navigation} product={product} data={data}/>}
                    />
                }

                <Pagination
                    navigation={navigation}
                    data={data}
                    setData={setData}
                />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 40
    },
    list: {
        flex: 1,
        borderRadius: 1,
        borderWidth: 0.5,
        borderColor: "grey",
        height: "100%",
    },
    noProducts: {
        fontSize: 25,
        color: "black",
        alignSelf: "center",
        padding: 20
    },
})

export default SearchScreen;