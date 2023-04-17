import {BackHandler, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {facetedProductSearch, SearchQuery} from "../../api";
import {updateCurrentPage, updateLoadingState} from "../../reducers/ui-reducer";
import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../hooks";

function Pagination({navigation, data, setData}) {
    const dispatch = useAppDispatch();
    const currentPage = useAppSelector(state => state.ui.currentPage);

    const backPressHandler = () => {
        if (currentPage <= 1) {
            navigation.goBack();
        }
        else {
            getPreviousPageHandler();
        }
        return true;
    }

    const getPreviousPageHandler = () => {
        let searchQuery : SearchQuery = {page: currentPage - 1, queryString: data?.query}

        navigation.navigate("Loading", {text: "Retrieving Results..."});
        facetedProductSearch(searchQuery).then((data) => {
            dispatch(updateCurrentPage(currentPage - 1))
            setData(data);
            navigation.navigate("Search", {data: data});
        })
        .catch((e) => {
            dispatch(updateLoadingState(false))
        });
    }

    const getNextPageHandler = () => {
        let searchQuery : SearchQuery = {page: currentPage + 1, queryString: data?.query};

        navigation.navigate("Loading", {text: "Retrieving Results..."});
        facetedProductSearch(searchQuery).then((data) => {
            dispatch(updateCurrentPage(currentPage + 1));
            setData(data);
            navigation.navigate("Search", {data: data});
        }).catch((e) => {
            dispatch(updateLoadingState(false));
        });
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backPressHandler);

        return () => {backHandler.remove()};
    }, [currentPage])


    return (
        <View style={styles.container}>
            {currentPage > 1 &&
                <TouchableOpacity onPress={getPreviousPageHandler}>
                    <Text>Previous</Text>
                </TouchableOpacity>
            }

            <Text>Page {currentPage} of {data?.pages}</Text>

            {currentPage != data?.pages &&
                <TouchableOpacity onPress={getNextPageHandler}>
                    <Text style={{alignSelf: "flex-end"}}>Next</Text>
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: -40,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        paddingVertical: 10,
        backgroundColor: "ghostwhite",
        borderWidth: 0.5,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    }
})

export default Pagination;