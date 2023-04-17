import React from "react";
import { Table, Row, Rows } from "react-native-table-component";

// table for seeing what the allergen identification in ocr-postprocessing.ts found allergens as, e.g. milk was m1lk
function AllergenListedAsTable({listedAs}) {
    return (
        <Table borderStyle={{borderWidth: 1}}>
            <Row textStyle={{margin: 8, fontWeight: "bold", color: "black"}} style={{backgroundColor: "#d6e5ff"}} data={["Allergen", "Listed as"]}/>
            {Object.entries(listedAs).map((entry) => {
                const allergen = `${entry[0].slice(0, 1).toUpperCase()}${entry[0].slice(1)}`;
                const allergenListings = [...entry[1]].join(", ");
                return <Row key={allergen} textStyle={{margin: 8}} style={{backgroundColor: "white"}} data={[allergen, allergenListings]}/>
            })}
        </Table>
    )
}

export default AllergenListedAsTable;