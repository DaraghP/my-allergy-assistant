import {Auth} from 'aws-amplify';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from "../screens/Home";
import AlertScreen from "../screens/Alert";
import ProfileScreen from "../screens/Profile";
import ScanHistory from '../screens/scan/ScanHistory';
import {useEffect, useState} from "react";
import {Dimensions} from "react-native";
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
import LogOut from "./LogOut";

const {height, width} = Dimensions.get("window");
function AuthenticatedApp() {
    const dispatch = useAppDispatch();
    const Tab = createBottomTabNavigator();
    const Stack = createNativeStackNavigator(); // for loading
    const navigationRef = createNavigationContainerRef();
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint);
    const account = useAppSelector(state => state.appData.accounts);
    const didSearch = useAppSelector(state => state.ui.didSearch);
    const loading = useAppSelector(state => state.ui.loading);
    const username = useAppSelector(state => state.user.username);
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username]?.notifications);
    const setupRequired = useAppSelector(state => state.user.username in state.appData.accounts ? !state.appData.accounts[state.user.username].hasCompletedSetup : null);
    const [appOpenedFromNotification, setAppOpenedFromNotification] = useState<boolean>(false);

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
      // if (true) {
      if (deviceEndpoint === ""){
        Notifications.registerRemoteNotifications();

        Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
            // console.log(`Device token given: ${event.deviceToken}`)
            registerDeviceToken(event.deviceToken).then((res) => {
              dispatch(updateDeviceEndpoint(res.deviceEndpoint));
              console.log("new endpoint:", res.deviceEndpoint);
            })
        })
      }
      // Notifications.getInitialNotification().then((res) => {
      //   console.log("getInitial res: ", res);
      //   if (res){
      //     console.log(typeof res);
      //     setAppOpenedFromNotification(true);
      //   } else {
      //     console.log(typeof res);
      //     setAppOpenedFromNotification(false);
      //   }
      // });
      // Notifications.isRegisteredForRemoteNotifications().then((res) => console.log("Receiving Notifications: ", res))

      Notifications.events().registerNotificationReceivedForeground((notification: Notification, completion) => {
        console.log(typeof notification.payload, notification.payload);//
        console.log(`Foreground notification received: ${notification.title}`);
        console.log(`     -   Body: ${notification.body}`);
        console.log(`     -   Payload: ${notification.payload}`);
        dispatch(addNotification({username: username, notificationData: notification.payload["data"], date: new Date()}));

        completion({alert: true, sound: true, badge: true});
      })

      Notifications.events().registerNotificationReceivedBackground((notification: Notification, completion: (response: NotificationCompletion) => void) => {
        console.log(`Background notification received: ${notification.title}`);
        console.log(`     -   Body: ${notification.body}`);
        console.log(`     -   Payload: ${notification.payload}`);

        dispatch(addNotification({username: username, notificationData: notification.payload["data"], date: new Date()}));

        completion({alert: true, sound: true, badge: true});
      })
    
      Notifications.events().registerNotificationOpened((notification: Notification, completion) => {
          Notifications.removeAllDeliveredNotifications();
          console.log("Notification opened: " + notification.payload);
          // setAppOpenedFromNotification(true);
          completion();
      });

      Notifications.getInitialNotification().then((notification) => {
          console.log("Initial notification was:", (notification ? notification.payload : 'N/A'));
      }).catch((err) => console.error("getInitialNotifiation() failed", err));

    }, [])

    useEffect(() => {
        console.log("account", JSON.stringify(account));
        console.log("setupRequired -> ", setupRequired);
    }, [setupRequired])

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
                  <Tab.Navigator screenOptions={{tabBarStyle: {display: loading ? "none" : "flex", height: height * 0.075, paddingBottom: 10}}}>
                      <Tab.Screen name="Home" component={HomeScreen} options={{headerShown: false, tabBarIcon: () => <FontAwesome5 name={"home"} size={height * 0.025}/>}}/>
                      {/* pass parameter to Home Screen if appOpenedFromNotification, from there navigate to Alerts. */}
                      <Tab.Screen name="Scan" component={ScanNavigator} options={{headerShown: false, tabBarIcon: () => <FontAwesome5 name={"camera"} size={height * 0.025}/>}}/>

                      <Tab.Screen name="Search" component={SearchScreen} options={searchTabOptions}/>
                      {/*  */}
                      <Tab.Screen name="Alerts" default={true} component={AlertScreen} options={{
                          headerTitleAlign: "center",
                          tabBarBadge: notifications?.filter(function(alert){return !alert?.isOpened}).length > 0 ? notifications.filter(function(alert){return !alert?.isOpened}).length : undefined,
                          tabBarBadgeStyle: {borderRadius: 10},
                          tabBarIcon: () => <FontAwesome5 name={"bell"} solid size={height * 0.025}/>
                      }}/>

                      <Tab.Screen
                          name="Profile" component={ProfileScreen}
                          options={{
                              tabBarIcon: () => <FontAwesome5 name={"user"} solid size={height * 0.025}/>,
                              headerRight: () => <LogOut style={{marginRight: 25}}/>
                          }}
                      />
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
                                    navigationRef.navigate("Profile");
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