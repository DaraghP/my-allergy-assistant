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
            {Object.keys(scans).length > 0
                ?
                Object.keys(scans).map((key) => (
                    <Text key={key}>{key}: {scans[key].date}</Text>
                ))
                :
                <Text style={{textAlign: "center", paddingVertical: 20}}>No scanned products</Text>
            }
            <Text>Test</Text>
            
        </>
    )
}

export default ScanHistory;