import {AppRegistry} from 'react-native';
import {useEffect, useState} from "react";
import App from './App';
import {name as appName} from './app.json';
import {Authenticator} from '@aws-amplify/ui-react-native';
import RNBootSplash from "react-native-bootsplash";
import {Provider} from "react-redux";
import {persistor, store} from "./store";
import {PersistGate} from "redux-persist/integration/react";
import {Camera} from "react-native-vision-camera";

export default function Index() {
    const [cameraPerms, setCameraPerms] = useState("");

    useEffect(() => {
        RNBootSplash.hide({fade: true}).then(async () => {
            setCameraPerms(await Camera.getCameraPermissionStatus());
            if (cameraPerms != "authorized") {
                console.log("test")
                setCameraPerms(await Camera.requestCameraPermission());
            }

        })
    }, [])

    useEffect(() => {
        console.log(cameraPerms)
    }, [cameraPerms])

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Authenticator.Provider>
                    {cameraPerms == "authorized" &&
                        <App/>
                    }
                </Authenticator.Provider>
            </PersistGate>
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => Index);
