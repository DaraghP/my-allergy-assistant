import {StyleSheet, TextInput, View} from "react-native";
import {useState} from "react";

interface SearchBarProps {
    style?: object,
    placeholder: string,
    handler: Function
}

function SearchBar({style = {}, placeholder, handler}: SearchBarProps) {
    const [query, setQuery] = useState<string>("");

    return (
        <View style={style}>
            <TextInput
                style={styles.searchBar}
                value={query}
                onChangeText={text => {
                    setQuery(text);
                    handler(text.toLowerCase());
                }}
                clearButtonMode={"always"}
                autoCorrect={false}
                autoCapitalize={"none"}
                placeholder={placeholder}
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