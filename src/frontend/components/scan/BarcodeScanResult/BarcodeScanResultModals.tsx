import React from "react";
import ReportModal from "./ReportModal";
import DeleteReportModal from "./DeleteReportModal";

function BarcodeScanResultModals({scan, productReports, setProductReports, myReportIndex, setMyReportIndex, isReportModalOpen, setIsReportModalOpen, isDeleteReportModalOpen, setIsDeleteReportModalOpen}) {
    return (
        <>
            <ReportModal
                scan={scan}
                isReportModalOpen={isReportModalOpen}
                setIsReportModalOpen={setIsReportModalOpen}
                productReports={productReports}
                setProductReports={setProductReports}
            />

            <DeleteReportModal
                isDeleteReportModalOpen={isDeleteReportModalOpen}
                setIsDeleteReportModalOpen={setIsDeleteReportModalOpen}
                scan={scan}
                productReports={productReports}
                setProductReports={setProductReports}
                myReportIndex={myReportIndex}
                setMyReportIndex={setMyReportIndex}
            />
        </>
    )
}

export default BarcodeScanResultModals;