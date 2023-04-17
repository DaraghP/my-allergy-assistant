import SearchBar from './SearchBar';
import {StyleSheet} from "react-native";
import {useAppDispatch} from "../../hooks";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { facetedProductSearch, SearchQuery } from "../../api";
import { updateDidSearch, updateLoadingState, updateCurrentPage } from "../../reducers/ui-reducer";


// Used in home to get products from OFF
function OFFSearch() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    return (
        <>
          <SearchBar
            style={styles.searchBar}
            placeholder={"Search for a product"}
            onSubmit={(query: string) => {
                navigation.navigate("Loading", {text: "Retrieving Results..."}); // loads loading screen
                const trim = (str) => {return str.trimStart().trimEnd();}
                let searchQuery : SearchQuery = {searchTerms: trim(query)}
                dispatch(updateCurrentPage(1));
                facetedProductSearch(searchQuery).then((data) => {
                    dispatch(updateDidSearch());
                    navigation.navigate("Search", {data: data}); // go to search screen
                })
                .catch((e) => {
                    dispatch(updateLoadingState(false))
                    navigation.navigate("Home");
                })
            }}
           />
        </>
    )
}

const styles = StyleSheet.create({
    searchBar: {
        width: "auto",
        justifyContent: "center",
        alignSelf: "center"
    }
})

export default OFFSearch;