import { facetedProductSearch, SearchQuery } from "../api";
import { useAppDispatch, useAppSelector } from "../hooks";
import {useRef, useState, useEffect} from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, Image, Dimensions, ScrollView } from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { updateLoadingState, updateDidSearch, updateCurrentPage } from "../reducers/ui-reducer";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { storeScan } from "../components/Scanner";


function SearchScreen({route}) {
    const {height, width} = Dimensions.get("window");
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user);
    const scans = useAppSelector(state => state.appData.accounts[user.username]?.scans);
    const navigation = useNavigation();
    const currentPage = useAppSelector(state => state.ui.currentPage);
    const [data, setData] = useState(route.params?.data);
    const isFocused = useIsFocused();
    const scrollRef = useRef<FlatList>()

    useEffect(() => {
        if (isFocused) {
            scrollRef.current?.scrollToIndex({index: 0, animated: false});
        }
    }, [isFocused])

    useEffect(() => {
        setData(route.params?.data);
    }, [route.params?.data])

    return (
        <SafeAreaView style={{flex: 1}}>
            <FlatList
                ref={scrollRef}

                style={{
                    flex: 1,
                    borderRadius: 1,
                    borderWidth: 0.5,
                    borderColor: "grey",
                    height: "100%"
                }}
                data={data?.products}
                keyExtractor={product => product.barcode}
                renderItem={(product) => (
                    <TouchableNativeFeedback onPress={() => {
                        storeScan(product.item.barcode, product.item.productResults, scans, dispatch, user);
                        navigation.navigate("Scan", { scan: product.item.productResults, data: data })
                    }}>
                        <View style={styles.item}>
                            <View style={{height: height * 0.18, alignSelf: "center", marginRight: 10, borderWidth: 10, borderColor: "#f1f1f1", backgroundColor: "#f1f1f1", borderRadius: 10}}>
                                <View style={{width: width * 0.18, height: height * 0.15, justifyContent: "center"}}>

                                    {product.item.image_url != null && <Image style={{resizeMode: "contain", flex: 1, alignItems: "center", borderRadius: 0}} source={{uri: product.item.image_url}}/>}
                                    {product.item.image_url == null && <Text style={{fontWeight: "200", alignSelf: "center", textAlign: "center"}}>No Image Available</Text>}
                                </View>

                            </View>
                            <View style={{flexDirection: "column", flexShrink: 1}}>
                                <Text style={{marginTop: 5, fontWeight: "bold"}}>Name</Text>
                                <Text style={{flex: 1, flexWrap: "wrap", marginTop: 5, textTransform: "capitalize"}}>{product.item.product_display_name}</Text>
                                <View style={{flexDirection: "row", alignItems: "center",}}>
                                    <FontAwesome5 style={{marginRight: 5}} name="eye" size={25}/>
                                    <Text>View for more information</Text>
                                </View>
                            </View>


                        </View>
                    </TouchableNativeFeedback>      
                )}
            />

            <View style={{width: "100%", flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, backgroundColor: "ghostwhite", borderWidth: 0.5, borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
                
                {currentPage > 1 && 
                    <TouchableOpacity 
                        onPress={() => {
                            let searchQuery : SearchQuery = {page: currentPage - 1, queryString: data?.query}

                            dispatch(updateLoadingState());
                            navigation.navigate("Loading", {text: "Retrieving Results..."});
                            facetedProductSearch(searchQuery).then((data) => {
                                dispatch(updateCurrentPage(currentPage - 1))
                                setData(data);
                                dispatch(updateLoadingState());
                                navigation.navigate("Search", {data: data});
                            });
                        }}
                    >
                        <Text>Previous</Text>
                    </TouchableOpacity>
                }

                <Text>{currentPage} / {data?.pages}</Text>

                {currentPage != data?.pages &&
                    <TouchableOpacity
                        onPress={() => {
                            let searchQuery : SearchQuery = {page: currentPage + 1, queryString: data?.query}

                            dispatch(updateLoadingState());
                            navigation.navigate("Loading", {text: "Retrieving Results..."});
                            facetedProductSearch(searchQuery).then((data) => {
                                dispatch(updateCurrentPage(currentPage + 1))
                                setData(data);
                                dispatch(updateLoadingState());
                                navigation.navigate("Search", {data: data});
                            });
                        }}
                    >
                        <Text style={{alignSelf: "flex-end"}}>Next</Text>
                    </TouchableOpacity>
                }
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    item: {
        width: "100%",
        flex: 1,
        flexDirection: "row",
        padding: 10,
        backgroundColor: "white",
        marginBottom: 1,
        borderColor: "lightgrey",
        borderWidth: 0.25
    }
})

export default SearchScreen;