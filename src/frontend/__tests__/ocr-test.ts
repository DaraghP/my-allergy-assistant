import "react-native";
import "react";
import {TextRecognition} from "@react-native-ml-kit/text-recognition";
import {readdirSync, readFileSync} from "fs";
import path from "path";


// setup
let images;
let expectedTexts;
const mockTestData = new Map();
export const setup = () => {
    images = readdirSync(path.join(__dirname, "/data/ocr/images"));
    expectedTexts = readdirSync(path.join(__dirname, "/data/ocr/text"));
    images.forEach((image, i) => {
        mockTestData.set(image, readFileSync(path.join(__dirname, `/data/ocr/text/${expectedTexts[i]}`), "utf-8"))
    })

    return new Map(mockTestData)
};

jest.mock("@react-native-ml-kit/text-recognition", () => ({
    TextRecognition: {
        recognize: jest.fn((imagePath) => {
            const ocrText = mockTestData.get(imagePath)
            return ocrText
        })
    }
}));

setup()
describe('OCR', () => {
    const generateOCRTestCases = async () => {
        for (const [imageData, expectedOCRText] of mockTestData.entries()) {
            it(`OCR scan of ${imageData} should match expected text`, () => {
                const ocrText = TextRecognition.recognize(imageData)
                expect(ocrText).toEqual(expectedOCRText)
            });
        }
    }

    generateOCRTestCases();

    it("OCR scan of image that does not exist gives undefined result", () => {
        const ocrText = TextRecognition.recognize("");
        expect(ocrText).toEqual(undefined)
    })
});
