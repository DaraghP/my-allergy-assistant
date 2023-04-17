import {Button, FlatList, StyleSheet, ToastAndroid, View} from "react-native";
import React, {useEffect, useState} from "react";
import AllergySelectionItem from "./AllergySelectionItem";
import SearchBar from "./search/SearchBar";
import filter from "lodash.filter";
import {useAppDispatch, useAppSelector} from "../hooks";
import {updateAllergens} from "../reducers/app-data-reducer";
import {User, postNewUser, updateUser} from "../api";
import ALLERGENS from "../allergens.json";
import _ from "lodash";
import { SafeAreaView } from "react-native-safe-area-context";

interface AllergySelectionListProps {
    onConfirm?: any,
    update?: boolean,
    customSelection?: any,
    setCustomSelection?: any
}

export const getAllergensList = () => {
    const AllergenList = ALLERGENS.data;
    let allergenArray: Array<string> = [];

    // loop over each allergen
    AllergenList.forEach((allergenObject) => {
        // add it to data list, which will be displayed to user in check-list
        allergenArray = allergenArray.concat(_.keys(allergenObject)[0]);
    });

    // sort alphabetically
    let data = allergenArray.sort();

    return data
}

function AllergySelectionList({onConfirm = null, update = true, customSelection = null, setCustomSelection = null} : AllergySelectionListProps) {
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);
    const email = useAppSelector(state => state.user.email);
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint);
    const user = useAppSelector(state => state.appData.accounts[username]);
    let data = getAllergensList();

    const [selection, setSelection] = useState<Set<string>>(new Set(user?.allergens));
    const [filteredData, setFilteredData] = useState(data);

    const searchHandler = (text: string) => {
        setFilteredData(
            filter(data, (allergen: string)  => {
                if (text == "") {
                    return true;
                }

                return allergen.toLowerCase().includes(text);
            })
        );
    }

    useEffect(() => {
        if (customSelection == null && user?.allergens.length > 0) {
            setSelection(new Set([...user?.allergens]))
        }
    }, [])

    return (
        <SafeAreaView style={{flex: 1}}>
            <FlatList
                style={styles.list}
                scrollEnabled={true}
                stickyHeaderIndices={[0]}
                ListHeaderComponentStyle={styles.listHeader}
                ListHeaderComponent={<SearchBar style={{justifyContent: "center"}} placeholder={"Search allergies"} onChangeText={searchHandler}/>}
                keyExtractor={allergen => allergen}
                data={filteredData}
                renderItem={
                    (item) => (
                        <AllergySelectionItem
                            selection={customSelection == null ? selection : customSelection}
                            setSelection={customSelection == null ? setSelection : setCustomSelection}
                        >
                            {item}
                        </AllergySelectionItem>
                    )
                }
            />
            {onConfirm !== null &&
                <View style={styles.confirmBtn}>

                    <Button title={"Confirm"} color={"green"} onPress={() => {
                        onConfirm()

                        if (update) {
                            let userObj : User = {username: username, deviceEndpoint: deviceEndpoint, email: email, allergens: [...selection], scans: user.scans}
                            dispatch(updateAllergens(userObj));
                            
                            // if hasCompletedSetup is false then create new user in DynamoDB via API
                            if (!user.hasCompletedSetup) {
                                postNewUser(userObj);
                            }
                            else {
                                // else, user is already created, so updateUser
                                updateUser(userObj);
                                ToastAndroid.show("Saving changes...", ToastAndroid.LONG)
                            }
                        }
                        
                    }}/>
                    
                </View>
            }
        </SafeAreaView>
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
    listHeader: {
        backgroundColor: "white",
        borderWidth: 0.25,
        borderColor: "lightgrey"
    },
    confirmBtn: {
        paddingTop: 10
    }
});

export default AllergySelectionList;