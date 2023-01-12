import {AppRegistry} from 'react-native';
import {useEffect} from "react";
import App from './App';
import {name as appName} from './app.json';
import {Authenticator} from '@aws-amplify/ui-react-native';
import RNBootSplash from "react-native-bootsplash";
import {Provider} from "react-redux";
import {persistor, store} from "./store";
import {PersistGate} from "redux-persist/integration/react";

export default function Index() {

    useEffect(() => {
        RNBootSplash.hide({fade: true})
    }, [])

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Authenticator.Provider>
                    <App/>
                </Authenticator.Provider>
            </PersistGate>
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => Index);
