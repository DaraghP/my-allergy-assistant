import { useAppSelector } from "../hooks";
import getAllergensFromText, {intersect, difference} from "../ocr-postprocessing";
import { useEffect, useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Collapsible from "react-native-collapsible";

function OCRScanResult(scan: object) {
    const account = useAppSelector(state => state.appData.accounts[state.user.username]);
    const userAllergens = account.allergens;
    const [userAllergensFound, setUserAllergensFound] = useState([]);
    const [allergensFound, setAllergensFound] = useState([]);
    const [userMayContain, setUserMayContain] = useState([]);
    const [mayContain, setMayContain] = useState([]);
    const [isTextOutputCollapsed, setIsTextOutputCollapsed] = useState<boolean>(true);
    scan = scan?.scan;

    // if any allergens included, show red
    // if no allergens included, but may contain one/more user allergen, show yellow
    // else show green

    const allergensRender = (allergens) => {
        return (
            allergens.length > 0 ? 
            allergens.map((allergen: string) => (
                <Text style={{textTransform: "capitalize", marginLeft: 25}} key={allergen}>{allergen}</Text>)
            ) 
            : <Text style={{marginLeft: 25}}>N/A</Text>
        );
    }

    useEffect(() => {
        const postprocessedResult = getAllergensFromText(scan?.ocrResult?.text, account);

        setAllergensFound(postprocessedResult?.allergens);
        setMayContain(postprocessedResult?.mayContain);
        setUserAllergensFound(postprocessedResult?.userAllergens);
        setUserMayContain(postprocessedResult?.mayContainUserAllergens);
        // console.log(postprocessedResult);
        console.log("USER ALLERGENS FOUND: ", postprocessedResult?.userAllergens)
        console.log("USER MAY CONTAIN ALLERGENS: ", postprocessedResult?.mayContainUserAllergens);
        console.log("OTHER ALLERGENS: ", postprocessedResult?.allergens);
        console.log("OTHER ALLERGENS THAT MAY BE CONTAINED: ", postprocessedResult?.mayContain);
   }, [])

    return (
        <View style={{flexDirection: "column"}}>
            <View style={{flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 25, borderBottomWidth: 25, borderBottomColor: userAllergensFound.length > 0 ? "red" : "green", backgroundColor: "white"}}>
                {userAllergensFound?.length == 0 && userMayContain?.length == 0 &&
                    <>
                        <FontAwesome5 color={"green"} style={{marginBottom: 10}} name="check-circle" size={100}/>
                        <Text style={styles.answerText}>Safe to eat</Text>
                        <Text style={{fontWeight: "200"}}>For assistance only, always verify your result</Text>
                    </>
                }

                {userAllergensFound?.length > 0 &&
                    <>
                        <FontAwesome5 color={"red"} style={{marginBottom: 10}} name="times-circle" size={100}/>
                        <Text style={styles.answerText}>Not Safe to eat</Text>
                    </>
                }

                {userAllergensFound?.length == 0 && userMayContain?.length > 0 &&
                    <>
                        <FontAwesome5 color={"red"} style={{marginBottom: 10}} name="exclamation-triangle" size={50}/>
                        <Text style={styles.answerText}>May not be safe to eat</Text>
                    </>
                }
            </View>

            <View style={{height: "auto", padding: 15, backgroundColor: "white",  borderBottomRadius: 5, paddingBottom: 50}}>
                <Text style={{...styles.resultHeader, marginBottom: 10}}>Results</Text>
                <Text style={styles.resultSubHeader}>Allergens found based on your profile</Text>
                {allergensRender(userAllergensFound)}
                <Text style={styles.resultSubHeader}>Allergens that may have been found based on your profile</Text>
                {allergensRender(userMayContain)}
                <Text style={styles.resultSubHeader}>Other Allergens found...</Text>
                {allergensRender(allergensFound)}
                <Text style={styles.resultSubHeader}>Other Allergens that may have been found</Text>
                {allergensRender(mayContain)}
                
                <View style={{width: "100%", marginTop: 50}}>
                    <View style={{backgroundColor: "white", width: "auto", paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#a1a1a1"}}>
                        <TouchableOpacity onPress={() => {setIsTextOutputCollapsed(!isTextOutputCollapsed)}}>
                            <View style={{flexDirection: "row"}}>
                                <FontAwesome5 style={{marginRight: 15}} name={isTextOutputCollapsed ? "chevron-down" : "chevron-up"} size={25}/>
                                <Text>View Output Text</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Collapsible collapsed={isTextOutputCollapsed} style={{backgroundColor: "ghostwhite", padding: 15, borderWidth: 0.5, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, borderTopWidth: 0}}>
                        <Text>{scan?.ocrResult?.text}</Text>
                    </Collapsible>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    answerText: {
        fontSize: 50,
        fontWeight: "800",
        color: "black"
    },
    resultHeader: {
        marginTop: 5,
        fontSize: 20,
        marginLeft: 5,
        fontWeight: "800",
        color: "black" 
    },
    resultSubHeader: {
        marginVertical: 25,
        fontSize: 20,
        marginLeft: 5,
        backgroundColor: "ghostwhite",
        padding: 10,
        borderWidth: 0.5,
        borderRadius: 5
    }
})

export default OCRScanResult;