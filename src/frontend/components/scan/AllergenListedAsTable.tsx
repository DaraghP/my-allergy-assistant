import React, {useMemo} from "react";
import { Table, Row } from "react-native-table-component";
import {useAppSelector} from "../../hooks";

// table for seeing what the allergen identification in ocr-postprocessing.ts found allergens as, e.g. milk was m1lk
function AllergenListedAsTable({listedAs, isBarcodeResult=false}) {
    // const listedAsKeys = Object.keys(listedAs);
    let allergenTitle = isBarcodeResult ? "User allergens detected" : "Allergens detected";
    const userAllergens = [...useAppSelector(state => state.appData.accounts[state.user.username].allergens)];
    const sortedAllergensListedAs = useMemo(() => {
        const tempListedAs = new Map();

        // user allergens found should be at top of table
        for (let userAllergen of userAllergens) {
            userAllergen = userAllergen.toLowerCase();
            if (userAllergen in listedAs) {
                tempListedAs.set(userAllergen, listedAs[userAllergen]);
            }

            for (const [key, value] of Object.entries(listedAs)) {
                // userAllergen may be found in listedAs due to links between allergens
                const allergenListedAs = [...value];

                for (const allergen of allergenListedAs) {
                    if (!tempListedAs.has(userAllergen) && userAllergen === allergen) {
                        tempListedAs.set(userAllergen, listedAs[userAllergen])
                    }
                }
            }
        }

        // any other allergen not already in the new map
        Object.entries(listedAs).forEach(([key, value]) => {
            if (!tempListedAs.has(key)) { // already added some allergens above in the table
                tempListedAs.set(key, value);
            }
        })

        return tempListedAs;
    }, [listedAs])


    return (
        <>
        {(sortedAllergensListedAs.size > 0) &&
            <Table borderStyle={{borderWidth: 1}}>
                <Row textStyle={{margin: 8, fontWeight: "bold", color: "black"}} style={{backgroundColor: "#d6e5ff"}} data={[allergenTitle, "Listed as"]}/>
                {[...sortedAllergensListedAs.entries()].map((entry, index) => {
                    const allergen = `${entry[0].slice(0, 1).toUpperCase()}${entry[0].slice(1)}`;
                    const allergenListings = [...entry[1]].join(", ");
                    return (
                        <Row
                            key={allergen}
                            textStyle={{
                                margin: 8,
                                color: userAllergens.includes(allergen) ? "black" : "",
                                fontWeight: userAllergens.includes(allergen) ? "bold" : "normal"}
                            }
                            style={{backgroundColor: "white", borderBottomColor: "black", borderBottomWidth: (index == sortedAllergensListedAs.size - 1) ? 0.5 : 0}}
                            data={[allergen, allergenListings]}
                        />
                    )
                })}

            </Table>
        }
        </>
    )
}

export default AllergenListedAsTable;