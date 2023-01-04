import React, {useEffect, useState,} from 'react';
import {Button, Text, Linking} from 'react-native';
import {Amplify, Auth} from 'aws-amplify';
// @ts-ignore
import {withOAuth} from 'aws-amplify-react-native';
import {Authenticator, useAuthenticator} from '@aws-amplify/ui-react-native';
import config from './aws-exports';
import {CognitoHostedUIIdentityProvider} from "@aws-amplify/auth";
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from "./screens/Home";
import InAppBrowser from "react-native-inappbrowser-reborn";

// as per Amplify docs: https://docs.amplify.aws/lib/auth/social/q/platform/react-native/#full-samples
async function urlOpener(url, redirect) {
    await InAppBrowser.isAvailable();
    const { type, url: newUrl } = await InAppBrowser.openAuth(url, redirect, {
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        ephemeralWebSession: false,
    })

    if (type == 'success') {
        Linking.openURL(newUrl);
    }
}

Amplify.configure({
    ...config,
    oauth: {
        ...config.oauth,
        urlOpener
    }
});

const App = (props) => {

  // const loginGoogle = useCallback(() => {
  //   Auth.federatedSignIn({provider: "google"});
  // }, []);//

  const Tab = createBottomTabNavigator();
  const navigationRef = createNavigationContainerRef();

    const { authStatus } = useAuthenticator(context => [context.authStatus]);

  useEffect(() => {
      // console.log("Auth.user = ", Auth.user)
  }, [Auth.user])
    
    
  useEffect(() => {
      console.log("isAuthent->", authStatus);
  }, [authStatus])

  return (
      <>
          {authStatus != "authenticated" ?

            <Authenticator
                Header={() => <Text>MyAllergyAssistant</Text>}
                Footer={() => <Button title={'Sign in with Google'} onPress={props.googleSignIn}/>}
            />
            :
            <NavigationContainer ref={navigationRef}>
              <Tab.Navigator>
                  <Tab.Screen name="Home" component={HomeScreen}/>
              </Tab.Navigator>
            </NavigationContainer>
          }
      </>
  );
};

export default withOAuth(App);
