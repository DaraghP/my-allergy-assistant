import React, {useEffect, useState,} from 'react';
import {Button, Text, Linking, StyleSheet, View} from 'react-native';
import {Amplify, Auth} from 'aws-amplify';
// @ts-ignore
import {withOAuth} from 'aws-amplify-react-native';
import {Authenticator} from '@aws-amplify/ui-react-native';
import config from './aws-exports';
import {Hub} from "aws-amplify";

import AuthenticatedApp from "./components/AuthenticatedApp";
import InAppBrowser from "react-native-inappbrowser-reborn";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useAppDispatch, useAppSelector} from "./hooks";
import {createAccount} from "./reducers/app-data-reducer";
import {updateUsername} from "./reducers/user-reducer";

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
        // console.log(newUrl)
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
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.appData.accounts);
  const [authStatus, setAuthStatus] = useState('unauthenticated');

  useEffect(() => {
    // documentation: https://docs.amplify.aws/guides/authentication/listening-for-auth-events/q/platform/js/
    let clearListener = Hub.listen('auth', (data) => {
      switch (data.payload.event) {
          case 'signIn':
            // check if username exists
            if (!(data.payload.data.username in accounts)) { //
                /*
                 case: the user does not have existing data of their account stored locally,
                 could happen when user deletes their app data or re-installs app
                 TODO: need to set up db and retrieve their allergen profile stored in AWS db
                */

                dispatch(createAccount(data.payload.data));
            }

            setAuthStatus('authenticated');
            dispatch(updateUsername(data.payload.data.username));

            break;
        case 'signUp':
            setAuthStatus('authenticated');

            dispatch(createAccount(data.payload.data));
            dispatch(updateUsername(data.payload.data.username));

            break;
        case 'signOut':
            setAuthStatus('unauthenticated')
            break;
        case 'signIn_failure':
            setAuthStatus('unauthenticated')
            break;
      }
    });

    // automatic sign-in
    Auth.currentAuthenticatedUser().then((user) => {
        if (user) {
            setAuthStatus("authenticated");
            dispatch(updateUsername(user.username));
        }
    })

    return () => {
        clearListener();
    }

  }, [])

  // useEffect(() => {
  //     console.log("Accounts", accounts)
  // }, [accounts])
  //
  // useEffect(() => {
  //     console.log("user", username);
  // }, [username])
  //

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
