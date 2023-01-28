import Scanner from "../../components/Scanner";

function ScanScreen({navigation, barcodeText, setBarcodeText}) {

    return <Scanner barcodeText={barcodeText} setBarcodeText={(text: string) => {setBarcodeText(text)}}/>;
}

export default ScanScreen;