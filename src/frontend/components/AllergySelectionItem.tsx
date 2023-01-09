import {StyleSheet, Text, TouchableNativeFeedback, View} from "react-native";
import React, {useEffect, ReactNode} from "react";
import CheckBox from '@react-native-community/checkbox';

function AllergySelectionItem({key = "", children, selection, setSelection}) {

    const select = () => {
        if (selection.has(children.item)) {
            selection.delete(children.item);
            setSelection(new Set([...selection]));

            // console.log(children.item, false);

        }
        else {
            selection.add(children.item);
            setSelection(new Set([...selection]));
            // console.log(children.item, true);

        }

    }

    useEffect(() => {
        // console.log(children.item, selection, selection.has(children.item))
    }, [selection])

    return (
        <TouchableNativeFeedback key={key} onPress={() => {select()}}>
            <View style={styles.container}>
                <CheckBox
                    value={selection.has(children.item)}
                    onChange={() => {select()}}
                />
                <Text>{children.item}</Text>
            </View>
        </TouchableNativeFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "white",
        marginBottom: 1,
        borderColor: "lightgrey",
        borderWidth: 0.25
    }
});

export default AllergySelectionItem;