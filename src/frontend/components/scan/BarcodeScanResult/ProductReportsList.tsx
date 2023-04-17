import {FlatList} from "react-native";
import React from "react";
import ProductReportsListItem from "./ProductReportsListItem";

function ProductReportsList({productReports, setMyReportIndex}) {
    return (
        <FlatList
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'flex-end',
            }}
            inverted={true}
            keyExtractor={(report, index) => report.user_id + index}
            showsHorizontalScrollIndicator={true}
            horizontal={true}
            data={productReports} renderItem={(report) => (
                <ProductReportsListItem report={report} setMyReportIndex={setMyReportIndex}/>
            )}
        />
    )
}

export default ProductReportsList;