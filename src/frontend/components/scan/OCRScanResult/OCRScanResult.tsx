import { useAppSelector } from "../../../hooks";
import getAllergensFromText from "../../../ocr-postprocessing";
import { useEffect, useState } from "react";
import {View, Text, StyleSheet} from "react-native";
import Accordion from "../../Accordion";
import SafetyResult from "../SafetyResult";
import AllergenListedAsTable from "../AllergenListedAsTable";

function OCRScanResult() {
    const scan = useAppSelector(state => state.ui.scanResult).scan;
    const account = useAppSelector(state => state.appData.accounts[state.user.username]);
    const [userAllergensFound, setUserAllergensFound] = useState([]);
    const [allergensFound, setAllergensFound] = useState([]);
    const [userMayContain, setUserMayContain] = useState([]);
    const [mayContain, setMayContain] = useState([]);
    const [listedAs, setListedAs] = useState({});
    const [isTextOutputCollapsed, setIsTextOutputCollapsed] = useState<boolean>(true);

    const allergensRender = (allergens) => {
        return (
            allergens.length > 0
            ?
            allergens.map((allergen: string) => (
                <Text style={styles.capitalizedText} key={allergen}>{allergen}</Text>)
            )
            :
            <Text style={styles.normalText}>N/A</Text>
        );
    }

    useEffect(() => {
        const postprocessedResult = getAllergensFromText(scan?.ocrResult?.text, account);

        setAllergensFound(postprocessedResult?.allergens);
        setMayContain(postprocessedResult?.mayContain);
        setUserAllergensFound(postprocessedResult?.userAllergens);
        setUserMayContain(postprocessedResult?.mayContainUserAllergens);
        setListedAs(postprocessedResult?.listedAs);
    }, [scan])

    return (
        <View style={{flexDirection: "column"}}>
            <SafetyResult userAllergensFound={userAllergensFound} userMayContain={userMayContain}/>

            <View style={styles.results}>
                <Text style={{...styles.resultHeader, marginBottom: 10}}>Results</Text>
                <Text style={styles.resultSubHeader}>Allergens found based on your profile</Text>
                {allergensRender(userAllergensFound)}
                <Text style={styles.resultSubHeader}>Allergens that may have been found based on your profile</Text>
                {allergensRender(userMayContain)}
                <Text style={styles.resultSubHeader}>Other Allergens found...</Text>
                {allergensRender(allergensFound)}
                <Text style={styles.resultSubHeader}>Other Allergens that may have been found</Text>
                {allergensRender(mayContain)}

                <Text style={styles.resultSubHeader}>Allergens listed as...</Text>
                <View style={{flex: 1, padding: 10}}>
                    <AllergenListedAsTable listedAs={listedAs}/>
                </View>

                <Accordion
                    style={styles.outputText}
                    headerText={"View Output Text"}
                    collapsed={isTextOutputCollapsed}
                    setCollapsed={setIsTextOutputCollapsed}
                    content={<Text>{scan?.ocrResult?.text}</Text>}
                />

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    outputText: {
        width: "100%",
        marginVertical: 30
    },
    normalText: {
        marginLeft: 25
    },
    capitalizedText: {
        textTransform: "capitalize",
        marginLeft: 25
    },
    answerText: {
        fontSize: 50,
        fontWeight: "800",
        color: "black"
    },
    results: {
        height: "auto",
        padding: 15,
        backgroundColor: "white",
        borderBottomRadius: 5,
        paddingBottom: 50
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