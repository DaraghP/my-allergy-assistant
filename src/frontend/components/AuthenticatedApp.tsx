import {Auth} from 'aws-amplify';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from "../screens/Home";
import ProfileScreen from "../screens/Profile";
import ScanHistory from '../screens/scan/ScanHistory';
import {useEffect, useState} from "react";
import SetupNavigator from "../screens/setup/SetupNavigator";
import {useAppSelector} from "../hooks";
import {HeaderBackButton} from '@react-navigation/elements';


function AuthenticatedApp() {
    const Tab = createBottomTabNavigator();
    // const navigation = useNavigation();
    const navigationRef = createNavigationContainerRef();
    const account = useAppSelector(state => state.appData.accounts);
    const setupRequired = useAppSelector(state => state.user.username in state.appData.accounts ? !state.appData.accounts[state.user.username].hasCompletedSetup : null);

    useEffect(() => {
        console.log("account", account)
        console.log("setupRequired -> ", setupRequired);
    }, [setupRequired])

    return (
       <>
            <NavigationContainer ref={navigationRef}>
              {setupRequired &&
                <SetupNavigator />
              }

              {!setupRequired && Auth.user != null &&
                  <Tab.Navigator>
                      <Tab.Screen name="Home" component={HomeScreen} options={{headerShown: false, tabBarIcon: () => <FontAwesome5 name={"home"} size={25}/>}}/>
                      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: () => <FontAwesome5 name={"user"} size={25}/>}}/>
                      <Tab.Screen 
                        name="ScanHistory" 
                        component={ScanHistory} 
                        options={{ 
                          tabBarButton: () => null,
                          headerTitle: "Scan History", 
                          headerTitleAlign: "center", 
                          headerLeft: (props) => (
                            <HeaderBackButton
                                {...props}
                                onPress={() => {
                                    console.log("Back button pressed.");
                                    navigationRef.goBack();
                                }}
                            />
                          )
                        }}
                      
                      />
                  </Tab.Navigator>
              }
            </NavigationContainer>
       </>
    )
}

export default AuthenticatedApp;