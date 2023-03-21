import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, Button } from "react-native";

interface ModalBtnsConfig {
    option1: {
        onPress: Function,
        text?: string
    },
    option2?: {
        onPress: Function,
        text?: string
    }
}

interface AppModalProps {
    headerText: string,
    modalContent?: React.ReactNode,
    modalContentText: string,
    modalBtnsConfig: ModalBtnsConfig,
    isModalOpen: {state: boolean, setState: Function}
}

function AppModal({headerText, modalContent = <></>, modalContentText, modalBtnsConfig, isModalOpen}: AppModalProps) {

    return (
        <Modal animationType="fade" visible={isModalOpen.state} onRequestClose={() => {isModalOpen.setState(!isModalOpen.state)}} transparent>
            <View style={styles.modal}>

                <Text style={styles.modalHeader}>{headerText}</Text>

                <View style={styles.modalContent}>

                    <Text>{modalContentText}</Text>

                    <View style={styles.content}>
                        {modalContent}
                    </View>

                    <View style={styles.modalBtnsContainer}>
                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={() => {
                                modalBtnsConfig.option1.onPress()
                                isModalOpen.setState(false);
                            }}
                        >
                            <Text style={styles.modalBtnText}>{modalBtnsConfig.option1.text}</Text>
                        </TouchableOpacity>

                        {modalBtnsConfig.option2 &&
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={() => {
                                    modalBtnsConfig.option2?.onPress()
                                    isModalOpen.setState(false);
                                }}
                            >
                                <Text style={styles.modalBtnText}>{modalBtnsConfig.option2?.text}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginVertical: "20%",
        marginHorizontal: 5,
        backgroundColor: "white",
        borderWidth: 0.5,
        borderRadius: 10
    },
    modalHeader: {
        padding: 5,
        paddingLeft: 10,
        color: "black",
        fontSize: 22,
        borderBottomWidth: 0.5,
        alignSelf: "center"
    },
    modalContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    content: {
        marginVertical: 10
    },
    modalBtnsContainer: {
        flexGrow: 0,
        // width: "100%",
        justifyContent: "center",
        flexDirection: "row"
    },
    modalBtn: {
      flex: 1,
      justifyContent: "center",
      borderWidth: 1,
      borderRadius: 5,
      marginTop: 5,
      marginHorizontal: 5,
      padding: 5,
      minWidth: "35%",
      maxWidth: "45%"
    },
    modalBtnText: {
      textAlign: "center"
    }
})


export default AppModal;