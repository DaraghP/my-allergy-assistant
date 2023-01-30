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
import {createAccount, updateAccounts} from "./reducers/app-data-reducer";
import {updateUsername, updateEmail} from "./reducers/user-reducer";
import { getSingleUser } from './api';


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
            // getSingleUser from DynamoDB
            Auth.currentAuthenticatedUser().then((user) => {
                dispatch(updateEmail(user.attributes.email))
                
                getSingleUser({username: data.payload.data.username, email: user.attributes.email}).then((res) => {
                    console.log("user -> ", res)
                    if (Object.keys(res).length > 0) {
                        console.log("user found! update redux");
                        dispatch(updateAccounts(res));
                    }
                    else {
                        console.log("user not found in dynamo, create new account/select allergens");
                        dispatch(createAccount(data.payload.data));
                    }
                    
                    setAuthStatus('authenticated');
                    dispatch(updateUsername(data.payload.data.username));
                    dispatch(updateEmail(user.attributes.email))                    
                })
            })

            break;
        case 'signUp':
            console.log("signUp block executed", data.payload.data);
            dispatch(createAccount({username: data.payload.data.userSub}));
            dispatch(updateUsername(data.payload.data.userSub));
            dispatch(updateEmail(data.payload.data.user.username));

            break;
        case 'signOut':
            setAuthStatus('unauthenticated')
            break;
        case 'signIn_failure':
            setAuthStatus('unauthenticated')
            break;
        case 'userDeleted':
            setAuthStatus('unauthenticated')
            break;
      }
    });

    // automatic sign-in
    Auth.currentAuthenticatedUser().then((user) => {
        if (user) {
            setAuthStatus("authenticated");
            dispatch(updateUsername(user.username));
            dispatch(updateEmail(user.attributes.email))
        }
    })

    return () => {
        clearListener();
    }

  }, [])

  useEffect(() => {
      console.log("Accounts", accounts)
  }, [accounts])
  
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
