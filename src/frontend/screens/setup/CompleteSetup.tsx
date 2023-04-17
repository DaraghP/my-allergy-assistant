import {Button, ScrollView, StyleSheet, Text, View} from "react-native";
import {setHasCompletedSetup} from "../../reducers/app-data-reducer";
import {useAppDispatch, useAppSelector} from "../../hooks";
import Accordion from "../../components/Accordion";
import React, {useState} from "react";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

function CompleteSetup({route, navigation}) {
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);//
    const [isAchievingResultsAccordionOpen, setIsAchievingResultsAccordionOpen] = useState<boolean>(false);

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Text style={styles.logoText}>MyAllergyAssistant</Text>
            </View>

            <ScrollView style={styles.contentContainer}>
                <View style={styles.rowCenter}>
                    <FontAwesome5Icon name={"exclamation-circle"} size={25}/>
                    <Text style={styles.heading}>Disclaimer</Text>
                </View>

                <Text>MyAllergyAssistant is in no way a complete replacement for verifying the allergens of food products and is solely for use as an assistant to aid in identifying allergens of given food products, results given should always be verified by the user.</Text>

                <View style={{...styles.rowCenter, marginTop: 25}}>
                    <FontAwesome5Icon name={"question-circle"} size={25}/>
                    <Text style={styles.heading}>FAQ</Text>
                </View>
                <Accordion
                    style={{marginTop: 15}}
                    contentStyle={{height: "auto"}}
                    collapsed={isAchievingResultsAccordionOpen}
                    setCollapsed={setIsAchievingResultsAccordionOpen}
                    headerText={"How to achieve the best results?"}
                    content={
                        <>
                            <Text>Always aim to provide an image taken in a well-lit environment, while in focus, and display the barcode or ingredients text in full.</Text>
                            <Text>{"\n"}Ingredients text found on packaging should be laid flat enough and be void of too much glare or shadows.</Text>
                            <Text>{"\n"}Barcodes should be clear enough for the camera to see, for barcodes, glare or shadow is acceptable in a lot of cases since it is scanned automatically.</Text>
                        </>
                    }
                />
                <View style={{marginVertical: 50}}>
                    <Button
                        title={"Finish Setup"}
                        color={"red"}
                        onPress={() => {
                            dispatch(setHasCompletedSetup(username));
                        }}
                    />
                </View>

            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "auto",
        flexDirection: "column",
        padding: 25
    },
    heading: {
        color: "black",
        fontSize: 25,
        marginVertical: 5,
        marginLeft: 15
    },
    logo: {
        width: "100%",
        padding: 30,
        marginBottom: 25,
        backgroundColor: "white",
        elevation: 3,
        shadowRadius: 3,
        borderRadius: 3,
        shadowColor: "black"
    },
    logoText: {
        textAlign:'center',
        fontWeight:"bold",
        fontSize:32
    },
    contentContainer: {
        height: "auto",
        backgroundColor: "white",
        marginVertical: 25,
        padding: 25,
        borderRadius: 10
    },
    rowCenter: {
        flexDirection: "row",
        alignItems: "center"
    }
})

export default CompleteSetup;