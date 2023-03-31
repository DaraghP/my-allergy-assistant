import {Button, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, View} from "react-native";
import {setHasCompletedSetup} from "../../reducers/app-data-reducer";
import {useAppDispatch, useAppSelector} from "../../hooks";
import Accordion from "../../components/Accordion";
import {useState} from "react";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

function CompleteSetup({route, navigation}) {
    const {height, width} = Dimensions.get("window")
    const dispatch = useAppDispatch();
    const username = useAppSelector(state => state.user.username);//
    const [isAchievingResultsAccordionOpen, setIsAchievingResultsAccordionOpen] = useState<boolean>(false);

    return (
        <View style={{flex: 1, height: "auto", flexDirection: "column", padding: 25}}>
            <Image
                style={{resizeMode: "cover", width: "100%", height: "25%", borderRadius: 15, borderWidth: 0.3, borderColor: "black"}}
                source={require("../../assets/maaLogo.png")}
            />

            <ScrollView style={{height: "auto", backgroundColor: "white", marginVertical: 25, padding: 25, borderRadius: 10}}>

                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <FontAwesome5Icon name={"exclamation-circle"} size={25}/>
                    <Text style={styles.heading}>Disclaimer</Text>
                </View>
                <Text>MyAllergyAssistant is in no way a complete replacement for verifying the allergens of food products and is solely for use as an assistant to aid in identifying allergens of given food products, results given should always be verified by the user.</Text>

                <View style={{flexDirection: "row", alignItems: "center", marginTop: 25}}>
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
                        </>
                    }
                />
                <View style={{marginVertical: 50}}>
                    <Button
                        title={"Finish"}
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
    heading: {
        color: "black",
        fontSize: 25,
        marginVertical: 5,
        marginLeft: 15
    }
})

export default CompleteSetup;