import Scanner, { ScanMode } from "../../components/Scanner";

function ScanScreen({route, barcodeText, setBarcodeText}) {

    return <Scanner barcodeText={barcodeText} setBarcodeText={(text: string) => {setBarcodeText(text)}}/>;
}

export default ScanScreen;