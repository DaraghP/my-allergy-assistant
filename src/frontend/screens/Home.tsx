import React from 'react';
import {View, ScrollView, Text, StyleSheet} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HomeHeader from "../components/home/HomeHeader";
import HomeScanButtons from "../components/home/HomeScanButtons";
import HomeSearchBox from "../components/home/HomeSearchBox";

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HomeHeader/>

      <View style={styles.btnsContainer}>
          <Text style={styles.btnsHeader}>Scan a product to learn about its ingredients and allergens</Text>
          <View style={styles.line}/>
          <HomeScanButtons navigation={navigation}/>
      </View>

      <HomeSearchBox/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f6ff",
    paddingBottom: 15
  },
  btnsContainer: {
    backgroundColor: "#f0f6ff",
    paddingBottom: 10
  },
  btnsHeader: {
    textAlign:"center",
    marginHorizontal: 40,
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    paddingBottom: 5
  },
  line: {
    marginVertical: 5,
    borderBottomWidth: 1,
    width: "80%",
    borderBottomColor: "#ccc",
    alignSelf: "center"
  }
});

export default HomeScreen;
