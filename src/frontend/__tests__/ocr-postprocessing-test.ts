import {setup} from "./ocr-test";
import getAllergensFromText from "../ocr-postprocessing";
import {readdirSync, readFileSync} from "fs";
import path from "path";

describe("OCR-postprocessing", () => {
    const user = {allergens: []}

    const generatePostProcessingTestCases = () => {
        const ocrTestData = [...setup().values()]
        const ocrAllergensData = readdirSync(path.join(__dirname, "/data/ocr/allergens"));
        for (let i = 0; i < ocrTestData.length; i++) {
            const allergens = readFileSync(path.join(__dirname, `/data/ocr/allergens/${ocrAllergensData[i]}`), "utf-8").split(",")
            // console.log(ocrAllergensData[i], allergens)
            // console.log(allergens)

            it(`${i + 1 < 10 ? "0" : ""}${i + 1}: getAllergensFromText should contain all of the expected user allergens`, () => {
                user.allergens = allergens;
                const res = getAllergensFromText(ocrTestData[i], user);

                const combinedUserAllergensList = [...res.userAllergens, ...res.mayContainUserAllergens];
                expect(combinedUserAllergensList).toEqual(user.allergens);
            })
        }
    }

    afterEach(() => {
        user.allergens = [];
    })

    it("should not get allergens from text if ingredients is undefined", () => {
        expect(getAllergensFromText(undefined, user)).toEqual(undefined);
    })

    it("should list peanuts as an allergen if correctly spelt", () => {
        const res = getAllergensFromText("peanuts", user);

        expect(res.allergens).toContain("peanuts");
    })

    it("should list peanuts as an user allergen if correctly spelt", () => {
        user.allergens = ["peanuts"];
        const res = getAllergensFromText("peanuts", user);

        expect(res.allergens).toEqual([]);
        expect(res.userAllergens).toContain("peanuts")
    })


    it("should list peanuts as an allergen if spelt as 'penuts'", () => {
        const res = getAllergensFromText("penuts", user);

        expect(res.allergens).toContain("peanuts");
    })

    it("should list peanut as an user allergen if spelt as 'penuts'", () => {
        user.allergens = ["peanuts"]
        const res = getAllergensFromText("penuts", user);

        expect(res.allergens).toEqual([]);
        expect(res.userAllergens).toContain("peanuts");
    })

    it("should not see peanuts with high certainty and be listed as may contain if 'pinenuts' in ingredients", () => {
        const res = getAllergensFromText("pinenuts", user);

        expect(res.mayContain).toContain("peanuts");
    })

    it("should not see peanuts (user allergen) with high certainty and be listed as may contain if 'pinenuts' in ingredients", () => {
        user.allergens = ["peanuts"];
        const res = getAllergensFromText("pinenuts", user);

        expect(res.mayContain).toEqual([]);
        expect(res.mayContainUserAllergens).toContain("peanuts")
    })


    generatePostProcessingTestCases()

})