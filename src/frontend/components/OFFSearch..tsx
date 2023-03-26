import SwitchSelector from "react-native-switch-selector";
import AllergySelectionList from '../components/AllergySelectionList';
import SearchBar from '../components/SearchBar';
import {Text, TextInput, View} from "react-native";
import {useAppDispatch, useAppSelector} from "../hooks";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { facetedProductSearch, SearchQuery } from "../api";
import { updateDidSearch, updateLoadingState, updateCurrentPage } from "../reducers/ui-reducer";

function OFFSearch() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const user = useAppSelector(state => state.appData.accounts[state.user.username]);
    const [selection, setSelection] = useState<Set<string>>(new Set());
    const [containsAllergenValue, setContainsAllergenValue] = useState<boolean>(true);
    const [brandValue, setBrandValue] = useState<string>("");
    const [categoryValue, setCategoryValue] = useState<string>("");

    return (
        <>
          <SearchBar
            style={{width: "95%", justifyContent: "center", alignSelf: "center"}}
            placeholder={"Enter product name"} 
            onSubmit={(query: string) => {
                const trim = (str) => {return str.trimStart().trimEnd();}
                let searchQuery : SearchQuery = {searchTerms: trim(query), brand: trim(brandValue), category: trim(categoryValue), allergens: [...selection], allergensContains: containsAllergenValue}
                navigation.navigate("Scan"); // gets rid of any previous scan result
                // navigation.goBack();
                dispatch(updateLoadingState());
                navigation.navigate("Loading", {text: "Retrieving Results..."}); // loads loading screen

                dispatch(updateCurrentPage(1));
                facetedProductSearch(searchQuery).then((data) => {
                    dispatch(updateDidSearch());
                    navigation.navigate("Search", {data: data}); // go to search screen
                    dispatch(updateLoadingState()); // no longer loading
                });
            }}
           />
          
          <View style={{backgroundColor: "#fcfcfc", shadowColor: 1, shadowRadius: 1, elevation: 50, borderRadius: 5, width: "90%", alignSelf: "center", padding: 20}}>
            <Text style={{marginBottom: 15, textAlign: "left", color: "black", fontSize: 15, fontWeight: "bold"}}>Search Filters</Text>

            <Text style={{marginVertical: 10}}>Brand</Text>
            <TextInput style={{paddingLeft: 10, borderWidth: 0.5, borderColor: "lightgrey", borderRadius: 10}} value={brandValue} onChangeText={(text: string) => {setBrandValue(text)}} />

            <Text style={{marginVertical: 10}}>Category</Text>
            <TextInput style={{paddingLeft: 10, borderWidth: 0.5, borderColor: "lightgrey", borderRadius: 10}} value={categoryValue} onChangeText={(text: string) => {setCategoryValue(text)}} />


            <Text style={{marginTop: 15, marginBottom: 5}}>Allergens</Text>
            <SwitchSelector
                initial={0}
                onPress={(val) => {
                    switch (val) {
                        case 0:
                            setContainsAllergenValue(true);
                            break;
                        case 1:
                            setContainsAllergenValue(false);
                            break;
                    }
                }}
                options={[
                    {label: "Contains", value: 0},
                    {label: "None", value: 1}
                ]}
                style={{width:"50%", marginBottom: 5}}
                height={25}
                hasPadding
                buttonMargin={1}
            />

            <AllergySelectionList customSelection={selection} setCustomSelection={setSelection}/>
            

          </View>
        </>
    )
}

export default OFFSearch;