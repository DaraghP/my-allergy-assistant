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
    <ScrollView contentContainerStyle={{backgroundColor: "#f0f6ff", paddingBottom: 15}}>
      <View style={{width: "100%", justifyContent: "flex-end", alignItems: "flex-end", paddingVertical: 25, marginBottom: 25, backgroundColor: "ghostwhite",  elevation: 20, shadowRadius: 10, shadowColor: "black"}}>
        <Image
              style={{width: "75%", maxWidth: "100%", maxHeight: "100%", aspectRatio: 6, alignSelf: "center", resizeMode: "contain"}}
              source={require("../assets/maaLogoTransparent.png")}
        />
      </View>
      <View style={{backgroundColor: "#f0f6ff", paddingBottom: 10}}>
          <Text style={{textAlign:"center", marginHorizontal: 40, fontSize: 18, color: "black", fontWeight: "bold", paddingBottom: 5}}>Scan a product to learn about its ingredients and allergens</Text>
          <View style={{marginVertical: 5, borderBottomWidth: 1, width: "80%", borderBottomColor: "#ccc", alignSelf: "center"}}/>
          <View style={styles.boxesContainer}>
            <View style={styles.boxContainer}>
              <TouchableOpacity style={{backgroundColor: "#FF6961", ...styles.box}} onPress={() => {navigation.navigate("Scan"); dispatch(updateScanMode(ScanMode.Barcode)); }}>
                <FontAwesome5Icon name={"barcode"} size={height * 0.1} color={"white"} />
                <Text style={styles.boxTitle}>Scan Barcode</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.boxContainer}>
              <TouchableOpacity style={{backgroundColor: "#BEA9DF", ...styles.box}} onPress={() => {navigation.navigate("Scan"); dispatch(updateScanMode(ScanMode.Text)); }}>
                <FontAwesome5Icon name={"list"} size={height * 0.1} color={"white"} />
                <Text style={styles.boxTitle}>Scan Ingredients</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{...styles.boxContainer, marginTop: 20}}>
            <TouchableOpacity style={{backgroundColor: "#F7CC3B", ...styles.bothBox}} onPress={() => {navigation.navigate("Scan"); dispatch(updateScanMode(ScanMode.Detect)); }}>
                <FontAwesome5Icon name={"binoculars"} size={height * 0.075} color={"white"} />
                <Text style={styles.boxTitle}>Scan Both</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{borderWidth: 0.5, marginTop: height * 0.025, backgroundColor: "#f4fcf8", shadowColor: 1, shadowRadius: 1, elevation: 50, borderRadius: 10, width: "90%", alignSelf: "center", padding: 20}}>
          <Text style={{textAlign: "left", color: "black", fontSize: 25, fontWeight: "bold", marginLeft: 25}}>Looking for something?</Text>
          <Text style={{marginLeft: 25, marginTop: 25}}>Find your product by name, or brand, and scan them for your allergens.</Text>

          <View style={{marginTop: 15, marginLeft:10, marginRight: 10}}>

            <OFFSearch/>
            <Text style={{marginLeft: 25, fontWeight: "400"}}>e.g. chocolate</Text>
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

export default HomeScreen;
