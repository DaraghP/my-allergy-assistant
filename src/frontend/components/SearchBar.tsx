import {StyleSheet, TextInput, View} from "react-native";
import {useState} from "react";

interface SearchBarProps {
    style?: object,
    placeholder: string,
    onChangeText?: Function
    onSubmit?: Function
}

function SearchBar({style = {}, placeholder, onChangeText = null, onSubmit = null}: SearchBarProps) {
    const [query, setQuery] = useState<string>("");

    return (
        <View style={style}>
            <TextInput
                style={styles.searchBar}
                value={query}
                onChangeText={text => {
                    setQuery(text);
                    if (onChangeText !== null) {
                        onChangeText(text.toLowerCase());
                    }
                }}
                clearButtonMode={"always"}
                autoCorrect={false}
                autoCapitalize={"none"}
                placeholder={placeholder}
                onSubmitEditing={() => {
                    if (onSubmit !== null) {
                        onSubmit(query);
                    }
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    searchBar: {
        backgroundColor: "white",
        borderColor: "lightgrey",
        borderRadius: 25,
        borderWidth: 1,
        padding: 10,
        margin: 10
    }
});

export default SearchBar;