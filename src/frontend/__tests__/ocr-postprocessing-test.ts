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

    it("should not list gluten-free as gluten as a likely allergen", () => {
        const res = getAllergensFromText("gluten-free", user);

        expect(res.allergens).toEqual([]);
        expect(res.mayContain).toContain("gluten");
    })

    it("should not list fats as oats as a likely allergen", () => {
        const res = getAllergensFromText("fats", user);

        expect(res.allergens).toEqual([]);
        expect(res.mayContain).toContain("oats");
    })

    it("should identify barley, wheat, and rye in allergens found if gluten in text", () => {
        const res = getAllergensFromText("gluten", user);

        expect(res.allergens).toEqual(["gluten", "wheat", "rye", "barley"])
    })

    it("should identify barley, wheat, and rye in allergens it may contain if 'glutpn' in text", () => {
        const res = getAllergensFromText("glutin", user);

        expect(res.mayContain).toEqual(["gluten", "wheat", "rye", "barley"])
    })


    it("should identify user allergens found as barley, wheat, and rye if gluten in text", () => {
        user.allergens = ["barley", "wheat", "rye"];
        const res = getAllergensFromText("gluten", user);

        expect(res.userAllergens).toEqual(user.allergens)
    })

    it("should list butter as milk", () => {
        const res = getAllergensFromText("butter", user);
        expect(res.allergens).toContain("milk")
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

        expect(res?.userAllergens).toContain("peanuts");
    })

    it("should not see peanuts with high certainty and be listed as may contain if 'pinenuts' in ingredients", () => {
        const res = getAllergensFromText("pinenuts", user);

        expect(res.mayContain).toContain("peanuts");
    })

    it("should not see peanuts (user allergen) with high certainty and be listed as may contain if 'pinenuts' in ingredients", () => {
        user.allergens = ["peanuts"];
        const res = getAllergensFromText("pinenuts", user);

        expect(res.userAllergens).toEqual([])
        expect(res.allergens).toEqual([])
        expect(res.mayContainUserAllergens).toContain("peanuts")
    })

    it("should contain walnuts as likely allergens if walnuts", () => {
        const res = getAllergensFromText("walnuts", user);
        expect(res?.allergens).toContain("walnuts");
    })

    it("should not detect barley if wheat and vice versa", () => {
        const res = getAllergensFromText("wheat", user);
        expect(res?.allergens).toEqual(["gluten", "wheat"]);
        expect(res?.allergens).not.toContain("barley");
    })

    it("should not detect wheat if barley and vice versa", () => {
        const res = getAllergensFromText("barley", user);
        expect(res?.allergens).toEqual(["gluten", "barley"]);
        expect(res?.allergens).not.toContain("wheat");
    })

    it("should detect all grains if gluten", () => {
        const res = getAllergensFromText("gluten", user);
        expect(res?.allergens).toEqual(["gluten", "wheat", "rye", "barley"]);
    })
    
    it("should detect all nuts (peanuts, walnuts, etc.) when 'nuts' is listed", () => {
        user.allergens = ["peanuts", "walnuts", "almonds", "brazil nuts", "cashew nuts", "hazelnuts", "milk"]
        const res = getAllergensFromText("nuts", user);

        expect(res.userAllergens).toEqual(["peanuts", "walnuts", "almonds", "brazil nuts", "cashew nuts", "hazelnuts"]);
        expect(res.mayContain).toEqual([])
    }) 

    generatePostProcessingTestCases()
})