import {AppRegistry} from 'react-native';
import {useEffect} from "react";
import App from './App';
import {name as appName} from './app.json';
import {Authenticator} from '@aws-amplify/ui-react-native';
import RNBootSplash from "react-native-bootsplash";


export default function Index() {

    useEffect(() => {
        RNBootSplash.hide({fade: true})
    }, [])

    return (
        <Authenticator.Provider>
            <App />
        </Authenticator.Provider>
    )
}

AppRegistry.registerComponent(appName, () => Index);
