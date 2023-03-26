import {Auth} from 'aws-amplify';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from "../screens/Home";
import AlertScreen from "../screens/Alert";
import ProfileScreen from "../screens/Profile";
import ScanHistory from '../screens/scan/ScanHistory';
import {useEffect, useState} from "react";
import SetupNavigator from "../screens/setup/SetupNavigator";
import {useAppSelector} from "../hooks";
import {HeaderBackButton} from '@react-navigation/elements';
import {Notification, NotificationCompletion, Notifications, Registered} from "react-native-notifications";
import ScanNavigator from "../screens/scan/ScanNavigator";
import { useAppDispatch } from '../hooks';
import SearchScreen from '../screens/SearchScreen';
import LoadingScreen from '../screens/LoadingScreen';
import {updateDeviceEndpoint} from '../reducers/user-reducer';
import {addNotification} from '../reducers/app-data-reducer';
import {registerDeviceToken} from "../api";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

function AuthenticatedApp() {
    const dispatch = useAppDispatch();
    const Tab = createBottomTabNavigator();
    const Stack = createNativeStackNavigator(); // for loading
    const navigationRef = createNavigationContainerRef();
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint);
    const account = useAppSelector(state => state.appData.accounts);
    const didSearch = useAppSelector(state => state.ui.didSearch);
    const loading = useAppSelector(state => state.ui.loading);// alright try report now
    const username = useAppSelector(state => state.user.username);
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username].notifications);
    const setupRequired = useAppSelector(state => state.user.username in state.appData.accounts ? !state.appData.accounts[state.user.username].hasCompletedSetup : null);

    const searchTabOptions = {
      headerTitle: "Search Results", 
      headerTitleAlign: "center", 
      headerLeft: (props) => (
        <HeaderBackButton
            {...props}
            onPress={() => {
                console.log("Back button pressed.");
                navigationRef.goBack();
            }}
        />
      ),
      tabBarIcon: () => <FontAwesome5 name={"search"} size={25}/>,
      tabBarButton: () => null
    };

    useEffect(() => {
      // mobile push notifications: https://wix.github.io/react-native-notifications/docs/
      if (deviceEndpoint == "") {
        Notifications.registerRemoteNotifications();

        Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
            // console.log(`Device token given: ${event.deviceToken}`)
            registerDeviceToken(event.deviceToken).then((res) => {
              dispatch(updateDeviceEndpoint(res.deviceEndpoint));
            })
        })
      }
      
      Notifications.events().registerNotificationReceivedForeground((notification: Notification, completion) => {
        console.log(typeof notification.payload, notification.payload);//
        console.log(`Foreground notification: ${notification.payload["gcm.notification.title"]} : ${notification.payload["gcm.notification.body"]} : ${notification.payload["gcm.notification.data"]}`);
        dispatch(addNotification({username: username, notification: notification.payload["gcm.notification.data"]}));

        completion({alert: true, sound: true, badge: true});
      })

      Notifications.events().registerNotificationReceivedBackground((notification: Notification, completion : (response: NotificationCompletion) => void) => {
        console.log(`Background notification: ${notification.title} : ${notification.body}`, notification.payload);

        dispatch(addNotification({username: username, notification: notification.payload["gcm.notification.data"]}));
        // do stuff with notification data
        completion({alert: true, sound: true, badge: true});
      })
    
      Notifications.events().registerNotificationOpened((notification: Notification, completion) => {
          console.log("Notification opened: " + notification.payload);
          completion();
      });
    }, [])

    useEffect(() => {
        console.log("account", JSON.stringify(account));
        console.log("setupRequired -> ", setupRequired);
    }, [setupRequired])

    // useEffect(() => {
    //   if (didSearch) {
    //     delete searchTabOptions["tabBarButton"];
    //     // setSearchTabOptions(searchTabOptions);  
    //     setSearchTabOptions({
    //       ...searchTabOptions,       
    //       headerLeft: (props) => (
    //         <HeaderBackButton
    //             {...props}
    //             onPress={() => {
    //                 console.log("Back button pressed.");
    //                 navigationRef.goBack();
    //             }}
    //         />
    //       )
            
    //     });
    //   }
    // }, [didSearch])

    return (
       <>
            <NavigationContainer ref={navigationRef}>
              {setupRequired &&
                <SetupNavigator />
              }

              {Auth.user == null &&
                <Stack.Navigator>
                    <Stack.Screen name={"Loading"} component={LoadingScreen}/>
                </Stack.Navigator>
              }

              {!setupRequired && Auth.user != null &&
                  <Tab.Navigator screenOptions={{tabBarStyle: {display: loading ? "none" : "flex"}}}>
                      <Tab.Screen name="Home" component={HomeScreen} options={{headerShown: false, tabBarIcon: () => <FontAwesome5 name={"home"} size={25}/>}}/>
                      <Tab.Screen name="Scan" component={ScanNavigator} options={{headerShown: false, tabBarIcon: () => <FontAwesome5 name={"eye"} size={25}/>}}/>

                      <Tab.Screen name="Search" component={SearchScreen} options={searchTabOptions}/>

                      <Tab.Screen name="Alerts" component={AlertScreen} options={{
                          tabBarBadge: notifications?.length > 0 ? notifications.length : undefined,
                          tabBarIcon: () => <FontAwesome5 name={"bell"} size={25}/>
                      }}/>

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

                      <Tab.Screen
                        name="Loading"
                        component={LoadingScreen}
                        options={{
                          tabBarButton: () => null,
                          header: () => null, 
                        }}
                      />
                  </Tab.Navigator>
              }
            </NavigationContainer>
       </>
    )
}

export default AuthenticatedApp;