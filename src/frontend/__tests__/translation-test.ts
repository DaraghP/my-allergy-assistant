import {translateIngredients} from "../utils";
import {readdirSync, readFileSync} from "fs";
import path from "path";


// setup
let srcTexts;
let tgtTexts;
const parallelCorpus = new Map();
const setup = () => {
    srcTexts = readdirSync(path.join(__dirname, "/data/translation/src"));
    tgtTexts = readdirSync(path.join(__dirname, "/data/translation/tgt"));
    srcTexts.forEach((srcText, i) => {
        parallelCorpus.set(srcText, readFileSync(path.join(__dirname, `/data/translation/tgt/${tgtTexts[i]}`), "utf-8"))
    })
};

setup()
describe('Translation', () => {
    const generateTranslationTestCases = async () => {
        for (const [srcTextFile, tgtText] of parallelCorpus.entries()) {
            it(`Translation of source language text (${srcTextFile}) should match expected target language text`, () => {
                const srcText = readFileSync(path.join(__dirname, `/data/translation/src/${srcTextFile}`), "utf-8")
                translateIngredients(srcText).then((actualTranslation) => {
                    expect(actualTranslation).toEqual(tgtText);
                })
            });
        }
    }

    generateTranslationTestCases();
});
