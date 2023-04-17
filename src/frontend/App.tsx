import React, {useEffect, useState,} from 'react';
import {Linking, StyleSheet, View, Image} from 'react-native';
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
import {getSingleUser} from './api';
import LoadingScreen from './screens/LoadingScreen';


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
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Auth hub documentation: https://docs.amplify.aws/guides/authentication/listening-for-auth-events/q/platform/js/
    let clearListener = Hub.listen('auth', (data) => {
      switch (data.payload.event) {
          case 'signIn':
            setIsLoggingIn(true);

            Auth.currentAuthenticatedUser().then((user) => {
                dispatch(updateEmail(user.attributes.email))
                
                getSingleUser({username: data.payload.data.username, email: user.attributes.email}).then((res) => {
                    // if user in db
                    if (Object.keys(res).length > 0) {
                        dispatch(updateAccounts({username:Object.keys(res)[0], data: Object.values(res)[0]}));
                    }
                    else {
                        // create account if not in db
                        dispatch(createAccount(data.payload.data));
                    }

                    // set auth status
                    setAuthStatus('authenticated');
                    dispatch(updateUsername(data.payload.data.username));
                    dispatch(updateEmail(user.attributes.email))
                    setIsLoggingIn(false);
                })
            })

            break;
        case 'signUp':
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
        case 'configured':
            setAuthStatus()
            break;
      }
    });

    // automatic sign-in
    Auth.currentAuthenticatedUser().then((user) => {
        if (user) {
            setIsLoggingIn(true);
            setAuthStatus("authenticated");
            dispatch(updateUsername(user.username));
            dispatch(updateEmail(user.attributes.email))
            setIsLoggingIn(false);
        }
    });

    return () => {
        clearListener();
    }
  }, [])

  return (
      <>
        {isLoggingIn ?
          <LoadingScreen/>
          :
          authStatus != "authenticated" ?
            <Authenticator
                Header={() => <Image style={styles.logo} source={require("./assets/maaLogoTransparent.png")}/>}
                Footer={() => {
                    return (
                        <View style={styles.footerContainer}>
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
            />
            :
            <AuthenticatedApp/>
        }
      </>
  );
};

const styles = StyleSheet.create({
    footerContainer: {
        marginHorizontal: 30
    },
    logo: {
        width: "75%",
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: 6,
        alignSelf: "center",
        resizeMode: "contain",
    },
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
