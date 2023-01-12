import {Alert, Button, FlatList, StyleSheet, View} from "react-native";
import React, {useEffect, useState} from "react";
import AllergySelectionItem from "./AllergySelectionItem";
import SearchBar from "./SearchBar";
import filter from "lodash.filter";
import {useAppDispatch, useAppSelector} from "../hooks";
import {setHasCompletedSetup, updateAllergens, updateNotSetTest} from "../reducers/app-data-reducer";

function AllergySelectionList({onConfirm}) {
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);
    const user = useAppSelector(state => state.appData.accounts[username]);

    // mock data
    let data: Array<string> = []
    for (let i = 1; i <= 50; i++) {
        data.push(`allergen${i}`);
    }

    const [selection, setSelection] = useState(new Set(user?.allergens));
    const [filteredData, setFilteredData] = useState(data);

    const searchHandler = (text: string) => {
        setFilteredData(
            filter(data, (allergen: string)  => {
                if (text == "") {
                    return true;
                }

                return allergen.includes(text);
            })
        );
    }

    useEffect(() => {
        if (user?.allergens.size > 0) {
            setSelection(new Set([...user.allergens]))
        }
    }, [])

    return (
        <>
            <FlatList
                style={styles.list}
                stickyHeaderIndices={[0]}
                ListHeaderComponentStyle={{backgroundColor: "white", borderWidth: 0.25, borderColor: "lightgrey"}}
                ListHeaderComponent={<SearchBar placeholder={"Search allergies"} handler={searchHandler}/>}
                keyExtractor={allergen => allergen}
                data={filteredData}
                renderItem={
                    (item) => (
                        <AllergySelectionItem
                            selection={selection}
                            setSelection={setSelection}
                        >
                            {item}
                        </AllergySelectionItem>
                    )
                }
            />

            <View style={styles.confirmBtn}>
                <Button title={"Confirm"} onPress={() => {
                    if (selection.size != 0) {
                        onConfirm()
                        dispatch(updateAllergens({username: username, allergens: [...selection]}));
                    }
                    else {
                        Alert.alert(
                            "Select your allergies",
                            "No allergies were selected. Please select at least one.",
                            [
                                {
                                    text: "OK",
                                }
                            ],
                            {cancelable: true}
                        )
                    }

                }}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    list: {
        flexGrow: 0,
        backgroundColor: "white",
        borderRadius: 1,
        borderWidth: 0.5,
        borderColor: "grey"
    },
    confirmBtn: {
        paddingTop: 10
    }
});

export default AllergySelectionList;