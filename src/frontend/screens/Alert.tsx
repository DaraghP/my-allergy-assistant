import { useAppSelector } from "../hooks";
import { FlatList, ScrollView, RefreshControl, SafeAreaView, Text, StyleSheet, TouchableOpacity} from "react-native";
import {useEffect, useState, useCallback, useMemo} from "react";
import { useNavigation } from "@react-navigation/native";
import { checkNotifications, openSettings } from 'react-native-permissions';
import AlertItem from "../components/alerts/AlertItem";

// component for alerts from reports retrieved/submitted gone through SNS to the users endpoint
function AlertScreen() {
    const navigation = useNavigation();
    const notifications = useAppSelector(state => state.appData.accounts[state.user.username].notifications);
    const [notificationPerms, setNotificationPerms] = useState("");

    const sortedNotifications = useMemo(() => {
        if (notifications) {
            return [...notifications].sort((notification1, notification2) => new Date(notification2.date) - new Date(notification1.date));
        }
        else {
            return []
        }
    }, [notifications])

    useEffect(() => {
        checkNotifications().then(({status, settings}) => {
            setNotificationPerms(status);
        });
    }, [notificationPerms])

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={() => {setNotificationPerms("");}}/>}>
                {(!notifications || notifications?.length == 0) &&
                    <Text style={styles.noAlerts}>No alerts received</Text>
                }

                {notificationPerms === "denied" &&
                    <Text style={styles.noAlerts}>
                        Notification permissions must be enabled to receive alerts.
                        <TouchableOpacity onPress={() => openSettings()}>
                            <Text>Enable notifications</Text>
                        </TouchableOpacity>
                    </Text>
                }

                <FlatList
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'flex-end',
                    }}
                    style={styles.list}
                    data={sortedNotifications}
                    keyExtractor={(alert, index) => {return index.toString()}}
                    renderItem={(alert) => <AlertItem navigation={navigation} alert={alert}/>}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f6ff"
    },
    list: {
        flex: 1,
        borderRadius: 1,
        borderWidth: 0.5,
        borderColor: "grey",
        height: "100%"
    },
    noAlerts: {
        fontSize: 25,
        color: "black",
        alignSelf: "center",
        padding: 20
    },
})

export default AlertScreen;