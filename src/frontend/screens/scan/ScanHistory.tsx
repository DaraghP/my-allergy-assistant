import { useAppSelector } from "../../hooks";
import { useEffect } from "react";
import { Text } from "react-native";

function ScanHistory({navigation}) {
    const username = useAppSelector(state => state.user.username);
    const scans = useAppSelector(state => state.appData.accounts[username].scans);
    // on page load:
    //  
    //  

    useEffect(() => {
        console.log("Previous scans => ", scans);
    }, [])

    return (
        <>
            {
                Object.keys(scans).map((key) => (
                    <Text key={key}>{key}: {scans[key].date}</Text>
                ))
            }
            
        </>
    )
}

export default ScanHistory;