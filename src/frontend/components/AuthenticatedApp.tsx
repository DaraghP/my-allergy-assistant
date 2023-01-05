import {Auth} from 'aws-amplify';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from "../screens/Home";
import ProfileScreen from "../screens/Profile";

function AuthenticatedApp() {
    const Tab = createBottomTabNavigator();
    const navigationRef = createNavigationContainerRef();

    return (
       <>
          {Auth.user != null &&
                <NavigationContainer ref={navigationRef}>
                  <Tab.Navigator>
                      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon: () => <FontAwesome5 name={"home"} size={25}/>}}/>
                      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: () => <FontAwesome5 name={"user"} size={25}/>}}/>
                  </Tab.Navigator>
                </NavigationContainer>
          }
       </>
    )
}

export default AuthenticatedApp;