import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, Button } from "react-native";
import {BlurView} from "@react-native-community/blur";

interface ModalBtnsConfig {
    option1?: {
        onPress: Function,
        text?: string,
    },
    option2?: {
        onPress?: Function,
        text?: string,
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
        <BlurView
            style={{position: isModalOpen.state ? "absolute" : "relative", top: 0, bottom: 0, left: 0, right: 0}}
            blurType={"xlight"}
            blurAmount={1}
            blurRadius={1}
            enabled={isModalOpen.state}
        >
            <Modal animationType="fade" visible={isModalOpen.state} onRequestClose={() => {isModalOpen.setState(!isModalOpen.state)}} transparent>
                <View style={styles.modal}>
                    <Text style={styles.modalHeader}>{headerText}</Text>

                    <View style={styles.modalContent}>
                        <Text ellipsizeMode={"clip"}>{modalContentText}</Text>

                        <View style={styles.content}>
                            {modalContent}
                        </View>

                        <View style={styles.modalBtnsContainer}>
                            {modalBtnsConfig.option1 &&
                                <TouchableOpacity
                                    style={{...styles.modalBtn, backgroundColor: "#0db700"}}
                                    onPress={() => {
                                        modalBtnsConfig.option1.onPress()
                                        isModalOpen.setState(false);
                                    }}
                                >
                                    <Text style={styles.modalBtnText}>{modalBtnsConfig.option1.text}</Text>
                                </TouchableOpacity>
                            }

                            {modalBtnsConfig.option2 &&
                                <TouchableOpacity
                                    style={{...styles.modalBtn, backgroundColor: "#ff5c5c"}}
                                    onPress={() => {
                                        if (modalBtnsConfig.option2?.onPress)
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

        </BlurView>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginVertical: "20%",
        marginHorizontal: 5,
        backgroundColor: "white",
        borderWidth: 0.5,
        borderRadius: 10,
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
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        padding: 25,
        marginTop: 25,
        backgroundColor: "ghostwhite",
        maxHeight: "80%",
        maxWidth: "95%",
        borderRadius: 5,
        borderWidth: 0.2
    },
    content: {
        marginVertical: 10
    },
    modalBtnsContainer: {
        flexGrow: 0,
        justifyContent: "center",
        flexDirection: "row",
    },
    modalBtn: {
      flex: 1,
      justifyContent: "center",
      borderWidth: 0.5,
      borderColor: "black",
      borderRadius: 5,
      marginTop: 5,
      marginHorizontal: 5,
      padding: 5,
      minWidth: "35%",
      maxWidth: "45%",
    },
    modalBtnText: {
      textAlign: "center",
      color: "white",
    }
})


export default AppModal;