import {Auth} from 'aws-amplify';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from "../screens/Home";
import AlertScreen from "../screens/Alert";
import ProfileScreen from "../screens/Profile";
import ScanHistory from '../screens/scan/ScanHistory';
import {useEffect, useState} from "react";
import {BackHandler, Dimensions, StyleSheet} from "react-native";
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
    const accounts = useAppSelector(state => state.appData.accounts)
    const Tab = createBottomTabNavigator();
    const Stack = createNativeStackNavigator(); // for loading
    const navigationRef = createNavigationContainerRef();
    const deviceEndpoint = useAppSelector(state => state.user.deviceEndpoint);
    const loading = useAppSelector(state => state.ui.loading);
    const username = useAppSelector(state => state.user.username);
    const setupRequired = useAppSelector(state => state.user.username in state.appData.accounts ? !state.appData.accounts[state.user.username].hasCompletedSetup : null);
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username]?.notifications);
    const notificationsBadge = notifications?.filter((alert) => (!alert?.isOpened)).length > 0 ? notifications.filter((alert) => (!alert?.isOpened)).length : undefined;

    const searchTabOptions = {
      headerTitle: "Search Results",
      headerTitleAlign: "center",
      headerLeft: (props) => (
        <HeaderBackButton
            {...props}
            onPress={() => {
                navigationRef.goBack();
            }}
        />
      ),
      tabBarIcon: () => <FontAwesome5 name={"search"} size={25}/>,
      tabBarButton: () => null
    };

    useEffect(() => {
      // mobile push notifications: https://wix.github.io/react-native-notifications/docs/
      if (deviceEndpoint === "") {
        Notifications.registerRemoteNotifications();

        Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
            registerDeviceToken(event.deviceToken).then((res) => {
              dispatch(updateDeviceEndpoint(res.deviceEndpoint));
            })
        })
      }

      Notifications.events().registerNotificationReceivedForeground((notification: Notification, completion) => {
        dispatch(addNotification({username: username, notificationData: notification.payload["data"], date: new Date()}));
        completion({alert: true, sound: true, badge: true});
      })

      Notifications.events().registerNotificationReceivedBackground((notification: Notification, completion: (response: NotificationCompletion) => void) => {
        dispatch(addNotification({username: username, notificationData: notification.payload["data"], date: new Date()}));
        completion({alert: true, sound: true, badge: true});
      })
    
      Notifications.events().registerNotificationOpened((notification: Notification, completion) => {
          Notifications.removeAllDeliveredNotifications();
          completion();
      });

      const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
              return true;
          }
      );

      return () => {backHandler.remove()};
    }, [])

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
                  <Tab.Navigator screenOptions={{tabBarStyle: {display: loading ? "none" : "flex", ...styles.tabNavigator}}}>
                      <Tab.Screen
                          name="Home"
                          component={HomeScreen}
                          options={{
                              headerShown: false,
                              tabBarIcon: () => <FontAwesome5 name={"home"} size={styles.tabIcon.height}/>
                          }}
                      />

                      <Tab.Screen
                          name="Scan"
                          component={ScanNavigator}
                          options={{
                              headerShown: false,
                              tabBarIcon: () => <FontAwesome5 name={"camera"} size={styles.tabIcon.height}/>
                          }}
                      />

                      <Tab.Screen
                          name="Search"
                          component={SearchScreen}
                          options={searchTabOptions}
                      />

                      <Tab.Screen
                          name="Alerts"
                          default={true}
                          component={AlertScreen}
                          options={{
                              headerTitleAlign: "center",
                              tabBarBadge: notificationsBadge,
                              tabBarBadgeStyle: {borderRadius: 10},
                              tabBarIcon: () => <FontAwesome5 name={"bell"} solid size={styles.tabIcon.height}/>
                          }}
                      />

                      <Tab.Screen
                          name="Profile" component={ProfileScreen}
                          options={{
                              tabBarIcon: () => <FontAwesome5 name={"user"} solid size={styles.tabIcon.height}/>,
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

const styles = StyleSheet.create({
    tabNavigator: {
        height: height * 0.075,
        paddingBottom: 10
    },
    tabIcon: {
        height: height * 0.025
    }
})

export default AuthenticatedApp;