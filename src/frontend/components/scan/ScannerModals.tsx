import AppModal from "../AppModal";
import {Image, Linking, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import React from "react";

function ScannerModals({ocrModalConfig, productNotFoundModalConfig, lastBarcodeSeen, photo, setPhoto}) {
    return (
        <>
          <AppModal
               isModalOpen={{state: ocrModalConfig.isOpen, setState: (bool: boolean) => {ocrModalConfig.setIsOpen(bool)}}}
               headerText={"Scan Ingredients"}
               modalContent={
                  <>
                    <View style={{marginVertical: 15}}>
                      <Image style={{height: 200, width: 200}} source={{uri: photo}} />
                      <TouchableOpacity
                          activeOpacity={0.5}
                          style={styles.crop}
                          onPress={() => {
                                ImagePicker.openCropper({
                                  path: photo,
                                  freeStyleCropEnabled: true,
                                  enableRotationGesture: true,
                                }).then(image => {
                                  setPhoto(image.path);
                                })
                          }}
                      >
                        <Text>Crop</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cropRecommendation}>For faster, and better results</Text>
                  </>
               }
               modalContentText={"Would you like to scan this product's ingredients?"}
               modalBtnsConfig={{
                   option1: {
                       onPress: ocrModalConfig.onPressYes,
                       text: "Yes"
                   },
                   option2: {
                       onPress: ocrModalConfig.onPressNo,
                       text: "No",
                   }
               }}
           />

            <AppModal
               isModalOpen={{state: productNotFoundModalConfig.isOpen, setState: (bool: boolean) => {productNotFoundModalConfig.setIsOpen(bool)}}}
               headerText={"Product NOT FOUND :("}
               modalContent={
                  <>
                    <Text>Barcode '{lastBarcodeSeen ?? 'N/A'}' not found in product database.</Text>
                    <Text style={{marginTop: 10}}>
                      Try scan ingredients instead or help future scanners by filling in the product's information via Open Food Facts.
                    </Text>
                      <Text style={{marginVertical: 10, color: "blue", textDecorationLine: "underline"}} onPress={() => {Linking.openURL("https://world.openfoodfacts.org/contribute")}}>
                         Click here to learn more
                      </Text>
                  </>
               }
               modalBtnsConfig={{
                   option1: {
                       onPress: productNotFoundModalConfig.onPressYes,
                       text: "Continue"
                   }
               }}
          />

        </>
    )
}

const styles = StyleSheet.create({
    crop: {
        backgroundColor: "ghostwhite",
        borderColor: "lightgrey",
        borderWidth: 1,
        padding: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    cropRecommendation: {
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: 3,
        fontWeight: "200",
        maxWidth: 200
    }
})


export default ScannerModals;