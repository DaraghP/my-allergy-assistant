import translate from "google-translate-api-x";

export const intersect = (set1, set2) => {
  return new Set([...set1].filter(x => set2.has(x.toLowerCase())));
}

export const difference = (set1, set2) => {
  return new Set([...set1].filter(x => !set2.has(x.toLowerCase())))
}

export async function extractEnglishAllergens(allergenList: Array<string>) {
  /*
  * This will either process translations already done by OFF otherwise we will translate the allergens if not translated
  * */

  if (allergenList) {
    let translatedAllergens = new Array();

    let i = 0;
    while (i < allergenList.length) {
      let allergen = allergenList[i];

      if (allergen.length > 0) {
        allergen = allergen.toLowerCase();
        if (allergen.includes("en:")) {
          let englishAllergen = allergen.slice(3).charAt(0).toUpperCase() + allergen.slice(4);
          if (!translatedAllergens.includes(englishAllergen)) {
            translatedAllergens.push(englishAllergen);
          }
        }
        else {
          // allergen is listed not in english, so translate
          let translation;
          if (allergen.charAt(2) === ':'){
            translation = await translate(allergen.slice(3), {from: allergen.slice(0, 2), to: 'en', forceTo: true, autoCorrect: true});
          }
          else {
            translation = await translate(allergen, {to: 'en', forceTo: true, autoCorrect: true});
          }

          if (translation.from.text.didYouMean){
            translation = await translate(translation.from.text.value.replace(/[[\]]/g,''), {to: 'en', forceTo: true, autoCorrect: true})
          }

          let translated_allergen = translation.text.charAt(0).toUpperCase() + translation.text.slice(1);
          if (!translatedAllergens.includes(translated_allergen)){
            translatedAllergens.push(translated_allergen);
          }
        }
      }
      i++;
    }

    return translatedAllergens.join(", ");
  }
}

export async function translateIngredients(ingredients: string) {
  if (ingredients?.length > 0){
    let translatedIngredients = await translate(ingredients, {to: 'en', forceTo: true, autoCorrect: true});

    return translatedIngredients.text;
  }
}

