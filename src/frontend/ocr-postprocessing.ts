import _ from "lodash";
import ALLERGENS from "./allergens.json";
import stringSimilarity from "string-similarity";

let possibleAllergens = ALLERGENS.data;
let possibleAllergensSet;
let possibleAllergensList = []
_.values(possibleAllergens).forEach(a => {
  possibleAllergensList.push(..._.values(a)[0])
});

const autocorrect = require("autocorrect")({words: possibleAllergensList});

possibleAllergensSet = new Set([...possibleAllergensList])
let probableMatchedAllergens = new Set();
let mayContain = new Set();
let listedAs = new Map();

function addToListedAs(key, ingredient) {
  if (!listedAs.has(key)) {
    listedAs.set(key, new Set())
  }
  
  listedAs.get(key).add(ingredient);
}

function addProbableAllergenIfRated(ingredient, match) {
  const P1 = 0.66; // fine-tuned through testing for normal cases
  const P2 = 0.4; // for auto-correction

  if (match.rating > P1) {
    probableMatchedAllergens.add(match.target);
    addToListedAs(match.target, ingredient);
  }
  else if (match.rating >= P2 && stringSimilarity.compareTwoStrings(autocorrect(ingredient), match.target) > P1) {
    // in the auto-corrected case, must be added to may contains as its not certain enough
    mayContain.add(match.target);
    addToListedAs(match.target, ingredient);
  }
}

function exactContainsMatch(ingredient) {
  possibleAllergensList.forEach((allergen) => {
    if (ingredient.includes(allergen)) {
      return allergen;
    }
  })

  return false;
}

function probableAllergens(ingredients) {
  // exact and fuzzy allergen matching
  for (let ingredient of ingredients) {
    ingredient = ingredient.trim();
    // compare allergens list to each ingredient, correct them if needed

    // exact allergen matching
    
    // exact match
    if (possibleAllergensSet.has(ingredient)) {
      probableMatchedAllergens.add(ingredient);
      addToListedAs(ingredient, ingredient);
      continue;
    }

    // exact contains/match
    let ingredientContainsAllergen = exactContainsMatch(ingredient);
    if (ingredientContainsAllergen) {
      probableMatchedAllergens.add(ingredientContainsAllergen);
      addToListedAs(ingredientContainsAllergen, ingredient);
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
    if (ingredients) {
        let userAllergensSet = new Set([...user.allergens])

        // go through ocr ingredients, find allergens
        probableAllergens(ingredients);
      
        const intersect = (set1, set2) => {
          return new Set([...set1].filter(x => set2.has(x)));
        }
        
        // compare allergens list processed from ocr output with user list
        let userAllergensFound = intersect(userAllergensSet, probableMatchedAllergens);
        let mayContainUserAllergens = intersect(userAllergensSet, mayContain);
      
        // user allergens found
        userAllergensFound.forEach((allergen) => {
          console.log("WARNING! Allergen: " + allergen + " detected. User IS allergic. Listed as: " + [...listedAs.get(allergen)])
        })
      
        // user allergens that might have been found
        mayContainUserAllergens.forEach((allergen) => {
          console.log("WARNING! May contain allergen: " + allergen + " possibly detected. User IS allergic. Listed as: " + [...listedAs.get(allergen)])
        })
        
        // no user allergens found, log any found
        probableMatchedAllergens.forEach((allergen) => {
          if (!userAllergensFound.has(allergen))
            console.log("WARNING! Allergen: " + allergen + " detected. User NOT allergic. Listed as: " + [...listedAs.get(allergen)])
        })
      
        mayContain.forEach((allergen) => {
          if (!mayContainUserAllergens.has(allergen))
            console.log("WARNING! May contain allergen: " + allergen + " possibly detected. User NOT allergic. Listed as: " + [...listedAs.get(allergen)])
        })
        
    }

    // for now... TODO: have may contain warnings to seperate
    return [...new Set([...probableMatchedAllergens, ...mayContain])]
}

export default getAllergensFromText;