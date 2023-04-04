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
import { requestNotifications } from 'react-native-permissions';

export default function Index() {
    const [cameraPerms, setCameraPerms] = useState("");

    useEffect(() => {
        // Request for notifications are required for versions Android 13 and above
        
        // after loading app
        RNBootSplash.hide({fade: true}).then(async () => {
            // request notification permissions
            requestNotifications(["alert", "badge", "sound"]).then(async ({status, settings}) => {
                console.log("notifications status:", status);
                // then request camera permissions
                if (cameraPerms != "authorized") {
                    console.log("test")
                    let cameraPermission = await Camera.requestCameraPermission()
                    console.log("finished waiting.");
                    setCameraPerms(cameraPermission);
                    console.log(cameraPermission);
                } else {
                    setCameraPerms(await Camera.getCameraPermissionStatus());
                }
            });
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
