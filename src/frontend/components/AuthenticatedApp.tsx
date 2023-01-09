import {Auth} from 'aws-amplify';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from "../screens/Home";
import ProfileScreen from "../screens/Profile";
import {useEffect, useState} from "react";
import SetupNavigator from "../screens/setup/SetupNavigator";


function AuthenticatedApp() {
    const [setupRequired, setSetupRequired] = useState<boolean|null>(null);
    const Tab = createBottomTabNavigator();
    const navigationRef = createNavigationContainerRef();

    useEffect(() => {
        // find out if setup is required
        setSetupRequired(true); // will change later

    }, [])

    return (
       <>
            <NavigationContainer ref={navigationRef}>
              {setupRequired &&
                <SetupNavigator setOutput={(output: boolean) => setSetupRequired(output)}/>
              }

              {setupRequired == false && Auth.user != null &&
                  <Tab.Navigator>
                      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon: () => <FontAwesome5 name={"home"} size={25}/>}}/>
                      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: () => <FontAwesome5 name={"user"} size={25}/>}}/>
                  </Tab.Navigator>
              }
            </NavigationContainer>
       </>
    )
}

export default AuthenticatedApp;