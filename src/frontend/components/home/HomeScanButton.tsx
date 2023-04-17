import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import React from "react";

const {height, width} = Dimensions.get("window");
function HomeScanButton({style = {}, text, isVertical = true, iconName, iconSize, color, onPress}) {
    return (
        <View style={{...styles.boxContainer, ...style}}>
          <TouchableOpacity style={{backgroundColor: color, ...(isVertical ? styles.verticalBox : styles.horizontalBox)}} onPress={onPress}>
            <FontAwesome5Icon name={iconName} size={iconSize} color={"white"} />
            <Text style={styles.boxTitle}>{text}</Text>
          </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    marginHorizontal: 5,
  },
  verticalBox: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    height: height * 0.33,
    width: width * 0.8 * 0.45,
    borderRadius: 10,
    elevation: 6,
    shadowColor: "black",
    padding: 20,
  },
  horizontalBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.38 * 0.4,
    width: width * 0.85,
    borderRadius: 10,
    elevation: 6,
    shadowColor: "black",
    padding: 20,
  },
  boxTitle: {
    maxWidth: "100%",
    textAlign: "center",
    marginTop: 5,
    fontSize: height * 0.025,
    color: "white",
    borderBottomWidth: 1,
    borderBottomColor: "white",
    paddingBottom: 2.5
  }
});


export default HomeScanButton;