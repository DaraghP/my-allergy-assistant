import { useEffect } from "react";
import {BackHandler, ScrollView, StyleSheet, Text} from "react-native";

function ScanHelp({navigation}) {

    useEffect(() => {
      const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
              navigation.navigate("ScanScreen");
              return true;
          }
      );

      return () => {backHandler.remove()};
    }, [])

    return (
        <ScrollView contentContainerStyle={{padding: 25}}>
            <Text style={{...styles.header, marginBottom: 25}}>Instructions</Text>
            <Text>
                Before you start scanning your product, we recommend a well-lit environment with low visibility of glare or shadows appearing on the product while scanning.
                With these ideal conditions, you can expect significant improvements in your results.
                {"\n\n"}
                 If this is not feasible, another option is to scan an image from your gallery, once an image is selected it will automatically scan for your barcode first then any text.
            </Text>
            <Text style={{...styles.header, borderBottomWidth: 0}}>Scanning Barcode</Text>
            <Text>
                First, make sure you're either in Scan Barcode or Scan Both mode, then point your camera at the product's barcode. If the barcode is valid, it should automatically scan the barcode and bring you to your scan result of the product you've scanned.
            </Text>

            <Text style={{...styles.header, borderBottomWidth: 0}}>Scanning Ingredients</Text>
            <Text>
                First, make sure you're either in Scan Ingredients or Scan Both mode, then point your camera at the product's ingredients listing, making sure the camera can see the word 'ingredient'.
                {"\n\n"}
                Once the camera sees 'ingredient' in the text you're pointing at, the camera button in the middle should illuminate bright red as an indication to take your scan.
                Try to keep your camera steady while the camera button is red, ensuring the camera is focused with little shadow and glare appearing on the product for best results.
                {"\n\n"}
                Once you are happy, go for it!
            </Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        color: "black",
        fontWeight: "bold",
        fontSize: 25,
        borderColor: "#d0cece",
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginVertical: 10
    }
})

export default ScanHelp;