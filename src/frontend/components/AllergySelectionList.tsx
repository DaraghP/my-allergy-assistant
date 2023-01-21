import {Alert, Button, FlatList, StyleSheet, View} from "react-native";
import React, {useEffect, useState} from "react";
import AllergySelectionItem from "./AllergySelectionItem";
import SearchBar from "./SearchBar";
import filter from "lodash.filter";
import {useAppDispatch, useAppSelector} from "../hooks";
import {updateAllergens} from "../reducers/app-data-reducer";
import {User, postNewUser, updateUser} from "../api";

function AllergySelectionList({onConfirm}) {
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);
    const email = useAppSelector(state => state.user.email);
    const user = useAppSelector(state => state.appData.accounts[username]);

    // mock data
    let data: Array<string> = []
    for (let i = 1; i <= 50; i++) {
        data.push(`allergen${i}`);
    }

    const [selection, setSelection] = useState<Set<string>>(new Set(user?.allergens));
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
                <Button title={"Confirm"} color={"green"} onPress={() => {
                    onConfirm()

                    let userObj : User = {username: username, email: email, allergens: [...selection]}
                    dispatch(updateAllergens(userObj));

                    // if hasCompletedSetup is false then create new user in DynamoDB via API
                    if (!user.hasCompletedSetup) {
                        postNewUser(userObj);
                    } else {
                        // else, user is already created, so updateUser
                        updateUser(userObj);
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