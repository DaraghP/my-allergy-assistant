import {getInitialNotificationState} from "../../api";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import SwitchSelector from "react-native-switch-selector";
import React from "react";


function ReceiveProductNotifications({style = {}, onPress, productId, scans}) {
    return (
        <SwitchSelector
            initial={getInitialNotificationState(productId, scans) ? 0 : 1}
            onPress={(val) => {onPress(val)}}
            options={[
                {
                    label: " ON",
                    customIcon: <FontAwesome5 name={"bell"} size={25}/>,
                    value: 0
                },
                {
                    label: " OFF",
                    customIcon: <FontAwesome5 name={"bell-slash"} size={25}/>,
                    value: 1
                }
            ]}
            style={style}
            buttonMargin={2}
            hasPadding
        />
    )
}

export default ReceiveProductNotifications;