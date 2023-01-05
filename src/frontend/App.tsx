import React, {useEffect, useState,} from 'react';
import {Button, Text, Linking, StyleSheet, View} from 'react-native';
import {Amplify, Auth} from 'aws-amplify';
// @ts-ignore
import {withOAuth} from 'aws-amplify-react-native';
import {Authenticator, useAuthenticator} from '@aws-amplify/ui-react-native';
import config from './aws-exports';
import {Hub} from "aws-amplify";

import AuthenticatedApp from "./components/AuthenticatedApp";
import InAppBrowser from "react-native-inappbrowser-reborn";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Amplify documentation: https://docs.amplify.aws/lib/auth/social/q/platform/react-native/#full-samples
async function urlOpener(url, redirect) {
    await InAppBrowser.isAvailable();
    const { type, url: newUrl } = await InAppBrowser.openAuth(url, redirect, {
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        ephemeralWebSession: false,
    })

    if (type == 'success') {
        console.log(newUrl)
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

  const [authStatus, setAuthStatus] = useState('unauthenticated');

  useEffect(() => {
    // documentation: https://docs.amplify.aws/guides/authentication/listening-for-auth-events/q/platform/js/
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
          case 'signIn':
            console.log('user signed in: ');
            setAuthStatus('authenticated');
            break;
        case 'signUp':
            // console.log('user signed up');
            setAuthStatus('authenticated');
            break;
        case 'signOut':
            // console.log('user signed out');
            setAuthStatus('unauthenticated')
            break;
        case 'signIn_failure':
            // console.log('user sign in failed');
            setAuthStatus('unauthenticated')
            break;
      }
    });

  }, [])

    return (
      <>
          {authStatus != "authenticated" ?
            <Authenticator
                Header={() => <Text style={{...styles.centerText, fontSize: 25}}>MyAllergyAssistant</Text>}
                Footer={() => {
                    return (
                        <View style={{marginHorizontal: 30}}>
                            <FontAwesome5.Button
                                style={{...styles.center, margin: 4}}
                                name={'google'}
                                backgroundColor={"blue"}
                                onPress={props.googleSignIn}
                            >
                                Sign in with Google
                            </FontAwesome5.Button>
                        </View>
                    )
                }}
                children={<AuthenticatedApp/>}
            />
            :
            <AuthenticatedApp/>
          }
      </>
  );
};

const styles = StyleSheet.create({
    centerText: {
        textAlign: "center"
    },
    center: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }
});


export default withOAuth(App);
