import {TouchableOpacity, Text, View, StyleSheet} from "react-native";
import React, {useEffect, useState} from "react";

interface TranslatedTextProps {
    style?: object,
    title?: string,
    originalText: string,
    translatedText: string
}

function TranslatedText({style = {}, title = "", originalText, translatedText} : TranslatedTextProps) {
    const [isTranslatedText, setIsTranslatedText] = useState(true);
    const [wasAlreadyTranslated, setWasAlreadyTranslated] = useState(false);

    const languageSwitchHandler = () => {
        if (!originalText[0].includes("en:")) {
            setIsTranslatedText(!isTranslatedText);
        }
    }

    useEffect(() => {
        if (originalText?.[0]?.includes("en:") || originalText == translatedText) {
            setWasAlreadyTranslated(true);
        }

    }, [translatedText])

    return (
        <TouchableOpacity activeOpacity={wasAlreadyTranslated && 100} style={{...style, ...styles.button}} onPress={languageSwitchHandler}>
            <Text><Text style={styles.title}>{title}:</Text>  {isTranslatedText ? translatedText : originalText}</Text>

            {!wasAlreadyTranslated &&
                <Text style={styles.info}>Translated, press to switch between languages</Text>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        marginVertical: 5
    },
    title: {
        fontWeight: "bold"
    },
    info: {
        marginBottom: 5,
        fontWeight: "200",
        color: "black",
        letterSpacing: 1.2
    }
})


export default TranslatedText;