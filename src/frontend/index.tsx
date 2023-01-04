import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Authenticator} from '@aws-amplify/ui-react-native';


export default function Index() {
    return (
        <Authenticator.Provider>
            <App />
        </Authenticator.Provider>
    )
}

AppRegistry.registerComponent(appName, () => Index);
