import {TouchableOpacity, Text, View} from "react-native";
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
        console.log(originalText)
        if (!originalText[0].includes("en:")) {
            setIsTranslatedText(!isTranslatedText);
        }
    }

    useEffect(() => {
        if (originalText?.[0]?.includes("en:") || originalText == translatedText) {
            setWasAlreadyTranslated(true);
        }
    }, [])

    return (
        <TouchableOpacity activeOpacity={wasAlreadyTranslated && 100} style={{...style, marginVertical: 5}} onPress={languageSwitchHandler}>
            <Text><Text style={{fontWeight: "bold"}}>{title}:</Text>  {isTranslatedText ? translatedText : originalText}</Text>

            {!wasAlreadyTranslated &&
                <Text style={{marginBottom: 5, fontWeight: "200", color: "black", letterSpacing: 1.2}}>Translated, press to switch between languages</Text>
            }
        </TouchableOpacity>
    )
}

export default TranslatedText;