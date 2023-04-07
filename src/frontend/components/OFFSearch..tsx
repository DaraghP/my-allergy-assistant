import SwitchSelector from "react-native-switch-selector";
import AllergySelectionList from '../components/AllergySelectionList';
import SearchBar from '../components/SearchBar';
import {StyleSheet, Text, TextInput, View} from "react-native";
import {useAppDispatch, useAppSelector} from "../hooks";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { facetedProductSearch, SearchQuery } from "../api";
import { updateDidSearch, updateLoadingState, updateCurrentPage } from "../reducers/ui-reducer";
import Accordion from "./Accordion";
import {MultipleSelectList} from "react-native-dropdown-select-list";
import ALLERGENS from "../allergens.json";
import _ from "lodash";

function OFFSearch() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const user = useAppSelector(state => state.appData.accounts[state.user.username]);
    const [selectionContains, setSelectionContains] = useState<Set<string>>(new Set());
    const [selectionNotContains, setSelectionNotContains] = useState<Set<string>>(new Set());
    const [containsAllergenValue, setContainsAllergenValue] = useState<boolean>(true);
    const [brandValue, setBrandValue] = useState<string>("");
    const [categoryValue, setCategoryValue] = useState<string>("");
    const AllergenList = ALLERGENS.data;

    let allergenArray: Array<string> = [];
    // loop over each allergen
    AllergenList.forEach((allergenObject) => {
        // add it to data list, which will be displayed to user in check-list
        allergenArray = allergenArray.concat(_.keys(allergenObject)[0]);
    });
    //sort alphabetically
    let data = allergenArray.sort();

    return (
        <>
          <SearchBar
            style={{width: "auto", justifyContent: "center", alignSelf: "center"}}
            placeholder={"Search for a product"}
            onSubmit={(query: string) => {
                dispatch(updateLoadingState());
                navigation.navigate("Loading", {text: "Retrieving Results..."}); // loads loading screen
                const trim = (str) => {return str.trimStart().trimEnd();}
                let searchQuery : SearchQuery = {searchTerms: trim(query)}//, brand: trim(brandValue), category: trim(categoryValue), allergensNotContains: [...selectionNotContains], allergensContains: [...selectionContains]}
                dispatch(updateCurrentPage(1));
                facetedProductSearch(searchQuery).then((data) => {
                    dispatch(updateDidSearch());
                    dispatch(updateLoadingState()); // no longer loading
                    navigation.navigate("Search", {data: data}); // go to search screen
                });

            }}
           />

          {/* <View style={{backgroundColor: "#fcfcfc", shadowColor: 1, shadowRadius: 1, elevation: 50, borderRadius: 10, width: "90%", alignSelf: "center", padding: 20}}>
            <Text style={{marginBottom: 15, textAlign: "left", color: "black", fontSize: 15, fontWeight: "bold"}}>Filter search based on allergens</Text> */}
            {/* <View style={{flex: 1, height: "100%"}}>
                <View style={{paddingBottom: 5}}>
                    <MultipleSelectList
                        style={styles.selectionList}//
                        label={'products not containing: '}
                        selected={[...selectionNotContains]}
                        setSelected={(value) => setSelectionNotContains(value)}
                        data={data}
                        save="value"
                        placeholder={'Filter products that do not contain specific allergens'}
                    />
                </View>

                <View style={{borderTopWidth: 1, borderTopColor: "lightgrey", paddingVertical: 5}}/>
                <MultipleSelectList
                    style={styles.selectionList}
                    label={'products containing:'}
                    selected={[...selectionContains]}
                    setSelected={(value) => setSelectionContains(value)}
                    data={data}
                    save="value"
                    placeholder={'Filter products containing specific allergen'}
                /> 
           
                </View>
          </View> 
          
          */}
        </>
    )
}

const styles = StyleSheet.create({
    selectionList: {
        flex: 1,
    }
})

export default OFFSearch;