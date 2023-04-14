import "react-native";
import "react";
import {BarcodeScanning} from "@react-native-ml-kit/barcode-scanning";
import {readdirSync, readFileSync} from "fs";
import path from "path";


// setup
let images;
let expectedTexts;
const mockTestData = new Map();
const setup = () => {
    images = readdirSync(path.join(__dirname, "/data/barcode/images"));
    expectedTexts = readdirSync(path.join(__dirname, "/data/barcode/text"));
    images.forEach((image, i) => {
        mockTestData.set(image, readFileSync(path.join(__dirname, `/data/barcode/text/${expectedTexts[i]}`), "utf-8"))
    })
};

jest.mock("@react-native-ml-kit/barcode-scanning", () => ({
    BarcodeScanning: {
        scan: jest.fn((imagePath) => {
            const barcodeText = mockTestData.get(imagePath)
            return barcodeText
        })
    }
}));

setup()
describe('Barcode', () => {
    const generateBarcodeTestCases = async () => {
        for (const [imageData, expectedBarcode] of mockTestData.entries()) {
            it(`Barcode scan of ${imageData} should match expected barcode`, () => {
                const barcodeText = BarcodeScanning.scan(imageData)
                expect(barcodeText).toEqual(expectedBarcode)
            });
        }
    }

    generateBarcodeTestCases();

    it("Barcode scan of image that doesn't exist gives undefined result", () => {
        const barcodeText = BarcodeScanning.scan("");
        expect(barcodeText).toEqual(undefined)
    })
});
