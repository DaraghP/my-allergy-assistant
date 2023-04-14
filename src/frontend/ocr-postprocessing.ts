import _ from "lodash";
import ALLERGENS from "./allergens.json";
import stringSimilarity from "string-similarity";

let possibleAllergens = ALLERGENS.data;
let possibleAllergensLinks = {};
let ingredientAllergenLinked = new Map();
let possibleAllergensSet;
let possibleAllergensList = []
_.values(possibleAllergens).forEach(a => {
  const allergenName = _.keys(a)[0].toLowerCase();
  const allergenListedAs = _.values(a)[0];
  allergenListedAs.forEach((allergen) => {
    if (allergen in possibleAllergensLinks) {
      // for example when gluten is found from barley, wheat, or rye
      possibleAllergensLinks[allergen] = [...new Set([...possibleAllergensLinks[allergen], ...allergenListedAs])];
      possibleAllergensLinks[allergen].splice(possibleAllergensLinks[allergen].indexOf(allergen), 1)
      ingredientAllergenLinked.set(allergen, null);
    }
    else {
      possibleAllergensLinks[allergen] = allergenListedAs;
      ingredientAllergenLinked.set(allergen, allergenName);
    }
    // possibleAllergensLinks[allergen] = Object.keys(a)[0].toLowerCase();
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
  const P1 = 0.66; // fine-tuned through testing for normal cases
  const P2 = 0.4; // for auto-correction

  if (match.rating > P1) {
    addAllergensToResultData(probableMatchedAllergens, possibleAllergensLinks[match.target], match.target, ingredient);
    // addArrayToSet(probableMatchedAllergens, possibleAllergensLinks[match.target]);
    // addToListedAs(possibleAllergensLinks[match.target], ingredient);
  }
  else if (match.rating >= P2 && stringSimilarity.compareTwoStrings(autocorrect(ingredient), match.target) > P1) {
    // in the auto-corrected case, must be added to may contains as its not certain enough
    addAllergensToResultData(mayContain, possibleAllergensLinks[match.target], match.target, ingredient);
    // addArrayToSet(mayContain, possibleAllergensLinks[match.target]);
    // addToListedAs(possibleAllergensLinks[match.target], ingredient);
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
  // exact and fuzzy allergen matching
  let ingredientAllergens;
  for (let ingredient of ingredients) {
    ingredient = ingredient.trim();
    // compare allergens list to each ingredient, correct them if needed

    // exact allergen matching
    
    // exact match
    if (possibleAllergensSet.has(ingredient)) {
      ingredientAllergens = possibleAllergensLinks[ingredient];
      addAllergensToResultData(probableMatchedAllergens, ingredientAllergens, ingredient, ingredient)
      // addArrayToSet(probableMatchedAllergens, ingredientAllergens);
      // addToListedAs(possibleAllergensLinks[ingredient], ingredient);
      continue;
    }

    // exact contains
    let ingredientContainsAllergen = exactContains(ingredient);
    if (ingredientContainsAllergen) {
      addAllergensToResultData(probableMatchedAllergens, possibleAllergensLinks[ingredientContainsAllergen], ingredient, ingredient)
      // addArrayToSet(probableMatchedAllergens, possibleAllergensLinks[ingredientContainsAllergen]);
      // addToListedAs(possibleAllergensLinks[ingredientContainsAllergen], ingredient);
    }
    else {
      let bestMatch;
      let bestMatchTargetTokens;
      let ingredientTokens;
      // fuzzy allergen matching
      
      // get best matching allergen with text similarity score 
      bestMatch = stringSimilarity.findBestMatch(ingredient, possibleAllergensList).bestMatch;
      
      // tokenisation
      bestMatchTargetTokens = bestMatch.target.split(" ");
      ingredientTokens = ingredient.split(" ");

      if (bestMatchTargetTokens.length == ingredientTokens.length) {
        // tokens of bestMatch ingredient length equals length of tokens of the best matched allergen in the dataset
        addProbableAllergenIfRated(ingredient, bestMatch);
      }
      else if (bestMatchTargetTokens.length < ingredientTokens.length) {
        // sub-best match e.g. matching milk in "ilk chocolate"
        let subBestMatch;
        
        // get best matches of all iterated ingredient tokens with allergens list
        ingredientTokens.forEach((token) => {
          subBestMatch = stringSimilarity.findBestMatch(token, possibleAllergensList).bestMatch
          addProbableAllergenIfRated(token, subBestMatch);
        })      
      } 
    }
  }

  // mayContain set must not include items from the probableMatchedAllergens set
  mayContain = new Set([...mayContain].filter(x => !probableMatchedAllergens.has(x)));
}

function getAllergensFromText(ingredients, user) {
  ingredients = ingredients?.toLowerCase().split(",");
//
  if (ingredients) {
    let userAllergensSet = new Set([...user.allergens.map((x: string) => x.toLowerCase())])

    // console.log("getAllergensFromText ", userAllergensSet)
    // go through ocr ingredients, find allergens
    probableAllergens(ingredients);
  
    // compare allergens list processed from ocr output with user list
    console.log("check for match: " + JSON.stringify([...userAllergensSet]) + " || " + JSON.stringify([...probableMatchedAllergens]));
    let userAllergensFound = intersect(userAllergensSet, probableMatchedAllergens);
    console.log("matches found: " + JSON.stringify([...userAllergensFound]));
    let mayContainUserAllergens = intersect(userAllergensSet, mayContain);

    // // user allergens found
    // userAllergensFound?.forEach((allergen) => {
    //   console.log("WARNING! Allergen: " + allergen + " detected. User IS allergic." )
    // })
  
    // // user allergens that might have been found
    // mayContainUserAllergens.forEach((allergen) => {
    //   console.log("WARNING! May contain allergen: " + allergen + " possibly detected. User IS allergic. Listed as: " + [...listedAs.get(allergen)])
    // })
    
    // // no user allergens found, log any found
    // probableMatchedAllergens.forEach((allergen) => {
    //   if (!userAllergensFound.has(allergen.charAt(0).toUpperCase() + allergen.slice(1)))
    //     console.log("WARNING! Allergen: " + allergen + " detected. User NOT allergic. Listed as: " + [...listedAs.get(allergen)])
    // })
  
    // mayContain.forEach((allergen) => {
    //   if (!mayContainUserAllergens.has(allergen.charAt(0).toUpperCase() + allergen.slice(1)))
    //     console.log("WARNING! May contain allergen: " + allergen + " possibly detected. User NOT allergic. Listed as: " + [...listedAs.get(allergen)])
    // })

    let result = getResult(userAllergensFound, mayContainUserAllergens, probableMatchedAllergens, mayContain)

    probableMatchedAllergens.clear();
    mayContain.clear();
    listedAs.clear();

    return result;
  }
}


// helper functions
export const intersect = (set1, set2) => {
  return new Set([...set1].filter(x => set2.has(x.toLowerCase())));
}

export const difference = (set1, set2) => {
  return new Set([...set1].filter(x => !set2.has(x.toLowerCase())))
}

const getResult = (userAllergensFound, mayContainUserAllergens, probableMatchedAllergens, mayContain) => {
  return {
    userAllergens: [...userAllergensFound], 
    mayContainUserAllergens: [...mayContainUserAllergens], 
    allergens: [...difference(probableMatchedAllergens, userAllergensFound)], 
    mayContain: [...difference(mayContain, mayContainUserAllergens)], 
    listedAs: listedAs
  }
}

export default getAllergensFromText;

