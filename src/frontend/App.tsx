import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {SafeAreaView, Text, Button} from 'react-native';
import {Amplify, Auth} from 'aws-amplify';
// @ts-ignore
import {Authenticator, useAuthenticator} from '@aws-amplify/ui-react-native';
import config from './aws-exports';

Amplify.configure(config);

const App = () => {
  const [email, setEmail] = useState('');

  const LogOut = () => {
    const {signOut} = useAuthenticator();

    return (
      <Button
        color={'red'}
        title={'Log out'}
        onPress={() => {
          signOut();
          setEmail('');
        }}
      />
    );
  };

  useEffect(() => {
    console.log('User has changed.');
  }, [Auth]);

  useEffect(() => {
    //setUserDetails(Auth.currentUserInfo());
    // let userDetails = Auth.currentUserInfo();
    // let authUserDetails = Auth.currentAuthenticatedUser({bypassCache: true})
    console.log(Auth.user);
    if (Auth.user != null) {
      console.log('authUser', Auth.user.attributes.email);
      setEmail(Auth.user.attributes?.email);
    } else {
      setEmail('');
    }
  }, [Auth.user]);

  // const login = useCallback(() => {
  //   Auth.federatedSignIn({provider: CognitoHostedUIIdentityProvider.Google});
  // }, []);

  return (
    <Authenticator.Provider>
      <Authenticator>
        <SafeAreaView>
          <Text>MyAllergyAssistant</Text>
          <LogOut />
          <Text>{email}</Text>
        </SafeAreaView>
      </Authenticator>
    </Authenticator.Provider>
  );
};

export default App;
