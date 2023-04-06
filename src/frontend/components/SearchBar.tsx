import {Dimensions, StyleSheet, TextInput, View} from "react-native";
import {useState} from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

interface SearchBarProps {
    style?: object,
    searchBarStyle?: object,
    placeholder: string,
    onChangeText?: Function
    onSubmit?: Function
}

const {height, width} = Dimensions.get("window");
function SearchBar({style = {}, searchBarStyle = {}, placeholder, onChangeText = null, onSubmit = null}: SearchBarProps) {

    const [query, setQuery] = useState<string>("");

    return (
        <View style={styles.searchContainer}>
            <TextInput
                style={{...styles.searchBar, ...searchBarStyle}}
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
            <FontAwesome5 style={{position: "absolute", right: width * 0.08, marginLeft: 20, flex: 1, alignSelf: "center", color: "lightgrey"}} name={"search"} size={25}/>
        </View>
    )
}

const styles = StyleSheet.create({
    searchBar: {
        flex: 1,
        backgroundColor: "white",
        borderColor: "lightgrey",
        borderRadius: 25,
        borderWidth: 1,
        padding: 10,
        paddingLeft: 20,
        paddingRight: width * 0.18,
        margin: 10
    },
    searchContainer: {
        flexDirection: "row"
    }
});

export default SearchBar;