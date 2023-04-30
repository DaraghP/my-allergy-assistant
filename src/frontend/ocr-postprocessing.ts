import _ from "lodash";
import ALLERGENS from "./allergens.json";
import stringSimilarity from "string-similarity";
import {difference, intersect} from "./utils";

// process allergen dataset for use
let possibleAllergens = ALLERGENS.data;
let possibleAllergensLinks = {};
let ingredientAllergenLinked = new Map();
let possibleAllergensSet;
let possibleAllergensList = []
_.values(possibleAllergens).forEach(a => {
  const allergenName = _.keys(a)[0].toLowerCase();
  const allergenListedAs = _.values(a)[0];

  // establish links between different allergens
  allergenListedAs.forEach((allergen) => {
    if (allergen in possibleAllergensLinks) {
      // for example when gluten is found from barley, wheat, or rye
      possibleAllergensLinks[allergen] = [...new Set([allergen, ...possibleAllergensLinks[allergen], ...allergenListedAs])];
      // possibleAllergensLinks[allergen].splice(possibleAllergensLinks[allergen].indexOf(allergen), 1)
      ingredientAllergenLinked.set(allergen, null);
    }
    else {
      possibleAllergensLinks[allergen] = [...new Set([allergen, ...allergenListedAs])];
      ingredientAllergenLinked.set(allergen, allergenName);
    }
  })

  possibleAllergensList.push(...Object.keys(possibleAllergensLinks));
});

const autocorrect = require("autocorrect")({words: possibleAllergensList});

possibleAllergensSet = new Set([...possibleAllergensList])
let probableMatchedAllergens = new Set();
let mayContain = new Set();
let listedAs = new Map();

function addAllergensToResultData(set, allergens, actualIngredient, ingredientText) {
    const mainAllergenName = ingredientAllergenLinked.get(actualIngredient)
    if (!mainAllergenName) {
      addArrayToSet(set, allergens);
      addToListedAs(allergens, ingredientText);
    }
    else {
      set.add(mainAllergenName);
      addToListedAs([mainAllergenName], ingredientText);
    }
}

function addToListedAs(keys, ingredient) {
  keys.forEach((key) => {
    if (!listedAs.has(key)) {
      listedAs.set(key, new Set())
    }

    listedAs.get(key).add(ingredient);

  })
}

function addProbableAllergenIfRated(ingredient, match) {
  const allergenSimilarityMaxThreshold = 0.67; // fine-tuned through testing for normal cases
  const allergenSimilarityMinThreshold = 0.4; // for severely misspelled words

  // if word is a close match, add allergen to results
  if (match.rating > allergenSimilarityMaxThreshold) { // for example, 'penuts' instead of 'peanuts' would pass here
    addAllergensToResultData(probableMatchedAllergens, possibleAllergensLinks[match.target], match.target, ingredient);
  }

  // for severely misspelled words, they must pass a rating of 0.4
  else if (match.rating >= allergenSimilarityMinThreshold) {
    // in this case, it should be added to may contains as its not certain enough to be correct
    addAllergensToResultData(mayContain, possibleAllergensLinks[match.target], match.target, ingredient);
  }
}

function exactContains(ingredient) {
  possibleAllergensList.forEach((allergen) => {
    if (ingredient.includes(allergen)) {
      return allergen;
    }
  })

  return false;
}

function addArrayToSet(set, array) {
  array.forEach(Set.prototype.add, set);
}

function probableAllergens(ingredients) {
  // exact and fuzzy allergen matching for allergens in text

  let ingredientAllergens;
  for (let ingredient of ingredients) {
    ingredient = ingredient.trim();
    // compare allergens list to each ingredient, correct them if needed

    // exact allergen matching
    
    // exact match
    if (possibleAllergensSet.has(ingredient)) {
      ingredientAllergens = possibleAllergensLinks[ingredient];
      addAllergensToResultData(probableMatchedAllergens, ingredientAllergens, ingredient, ingredient)
      continue;
    }

    // exact contains
    let ingredientContainsAllergen = exactContains(ingredient);
    if (ingredientContainsAllergen) {
      addAllergensToResultData(probableMatchedAllergens, possibleAllergensLinks[ingredientContainsAllergen], ingredient, ingredient)
    }
    else {
      let bestMatch;
      let bestMatchTargetTokens;
      let ingredientTokens;

      // fuzzy allergen matching
      
      // get best matching allergen with text similarity score 
      bestMatch = stringSimilarity.findBestMatch(ingredient, possibleAllergensList).bestMatch;
      
      // tokenisation step
      bestMatchTargetTokens = bestMatch.target.split(" ");
      ingredientTokens = ingredient.split(" ");

      if (bestMatchTargetTokens.length == ingredientTokens.length) {
        // tokens of the best matched ingredient length equals length of tokens of the best matched allergen in the dataset
        addProbableAllergenIfRated(ingredient, bestMatch);
      }
      else if (bestMatchTargetTokens.length < ingredientTokens.length) {
        // best sub-match e.g. matching milk in "ilk chocolate"
        let bestSubMatch;

        // get best matches of all iterated ingredient tokens with allergens list
        ingredientTokens.forEach((token) => {
          bestSubMatch = stringSimilarity.findBestMatch(token, possibleAllergensList).bestMatch
          addProbableAllergenIfRated(token, bestSubMatch);
        })      
      } 
    }
  }

  // mayContain set must not include items from the probableMatchedAllergens set
  mayContain = new Set([...mayContain].filter(x => !probableMatchedAllergens.has(x)));
}

function getAllergensFromText(ingredients, user) {
  ingredients = ingredients?.toLowerCase().split(",");

  if (ingredients) {
    let userAllergensSet = new Set([...user.allergens.map((x: string) => x.toLowerCase())])

    // go through OCR ingredients, find allergens
    probableAllergens(ingredients);
  
    // compare allergens list processed from ocr output with user list
    let userAllergensFound = intersect(userAllergensSet, probableMatchedAllergens);
    let mayContainUserAllergens = intersect(userAllergensSet, mayContain);

    // compile results
    let result = getResult(userAllergensFound, mayContainUserAllergens, probableMatchedAllergens, mayContain, Object.fromEntries([...listedAs]));

    probableMatchedAllergens.clear();
    mayContain.clear();
    listedAs.clear();

    return result;
  }
}

const getResult = (userAllergensFound, mayContainUserAllergens, probableMatchedAllergens, mayContain, listedAs) => {
  return {
    userAllergens: [...userAllergensFound], 
    mayContainUserAllergens: [...mayContainUserAllergens], 
    allergens: [...difference(probableMatchedAllergens, userAllergensFound)], 
    mayContain: [...difference(mayContain, mayContainUserAllergens)], 
    listedAs: listedAs
  }
}

export default getAllergensFromText;

