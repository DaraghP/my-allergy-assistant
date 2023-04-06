import SearchBar from '../components/SearchBar';
import React, { useState } from 'react';
import {Image, View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions} from "react-native";
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import SwitchSelector from "react-native-switch-selector";
import AllergySelectionList from '../components/AllergySelectionList';
import { useAppDispatch, useAppSelector } from '../hooks';
import OFFSearch from '../components/OFFSearch.';
import { useNavigation } from "@react-navigation/native";
import { ScanMode } from '../components/Scanner';
import { updateScanMode } from '../reducers/ui-reducer';

const {height, width} = Dimensions.get("window");
function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  return (
    <ScrollView contentContainerStyle={{height: "auto", flexDirection: "column"}}>
      <View style={{width: "100%", justifyContent: "flex-end", alignItems: "flex-end", paddingVertical: 25, marginBottom: 25, backgroundColor: "ghostwhite",  elevation: 20, shadowRadius: 10, shadowColor: "black"}}>
        <Image
              style={{width: "75%", maxWidth: "100%", maxHeight: "100%", aspectRatio: 6, alignSelf: "center", resizeMode: "contain"}}
              source={require("../assets/maaLogoTransparent.png")}
        />
      </View>

      <View style={{flexDirection: "column"}}>
          {/* <Text style={{textAlign:"center", marginHorizontal: 40, fontSize: 15, fontWeight: "bold"}}></Text> */}
          <View style={styles.boxesContainer}>
            <View style={styles.boxContainer}>
              <TouchableOpacity style={{backgroundColor: "red", ...styles.box}} onPress={() => {navigation.navigate("Scan"); dispatch(updateScanMode(ScanMode.Barcode)); }}>
                <FontAwesome5Icon name={"barcode"} size={height * 0.1} color={"white"} />
                <Text style={styles.boxTitle}>Scan Barcode</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.boxContainer}>
              <TouchableOpacity style={{backgroundColor: "#63C8F2", ...styles.box}} onPress={() => {navigation.navigate("Scan"); dispatch(updateScanMode(ScanMode.Text)); }}>
                <FontAwesome5Icon name={"list"} size={height * 0.1} color={"white"} />
                <Text style={styles.boxTitle}>Scan Ingredients</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{...styles.boxContainer, marginTop: 15}}>
            <TouchableOpacity style={{backgroundColor: "#F7CC3B", ...styles.bothBox}} onPress={() => {navigation.navigate("Scan"); dispatch(updateScanMode(ScanMode.Detect)); }}>
                <FontAwesome5Icon name={"binoculars"} size={height * 0.075} color={"white"} />
                <Text style={styles.boxTitle}>Scan Both</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* */}
        <View style={{marginTop: 25}}>
          <Text style={{textAlign: "left", color: "black", fontSize: 25, fontWeight: "bold", marginLeft: 25}}>Looking for something?</Text>
          <View style={{marginLeft:10, marginRight: 10}}>
            <OFFSearch/>
          </View>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  boxesContainer: {
    height:"auto",
    // flex: 1,
    // width: "100%",
    flexDirection: "row",
    // justifyContent: "center",
    padding: 10
  },
  boxContainer: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    marginHorizontal: 5,
  },
  box: {
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
  bothBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.38 * 0.38,
    width: width * 0.8,
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

export default HomeScreen;
