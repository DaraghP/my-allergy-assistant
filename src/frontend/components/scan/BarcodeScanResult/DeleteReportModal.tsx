import AppModal from "../../AppModal";
import {deleteProductReport} from "../../../api";
import {deleteNotification} from "../../../reducers/app-data-reducer";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";

function DeleteReportModal({isDeleteReportModalOpen, setIsDeleteReportModalOpen, scan, productReports, setProductReports, myReportIndex, setMyReportIndex}) {
    const username = useAppSelector(state => state.user.username);
    const dispatch = useAppDispatch();

    return (
        <AppModal
            isModalOpen={{state: isDeleteReportModalOpen, setState: (bool: boolean) => {setIsDeleteReportModalOpen(bool)}}}
            headerText={"Are you sure you want to delete your report for this product?"}
            modalContentText={"Delete Report?"}
            modalBtnsConfig={{
                option1: {
                    onPress: () => {
                        // delete report from dynamo
                        deleteProductReport({productId: scan?.product_code}, myReportIndex);

                        // remove from local reports variable, so that the page updates without needing refresh
                        dispatch(deleteNotification({username: username, productId: scan?.product_code}));

                        // set product reports
                        let tmpReports = [...productReports];
                        tmpReports.splice(myReportIndex, 1);
                        setProductReports(tmpReports);
                        setMyReportIndex(-1);
                    },
                    text: "Yes - Delete Report",
                },
                option2: {
                    text: "No - Cancel",
                },
            }}
        />
    )
}

export default DeleteReportModal;