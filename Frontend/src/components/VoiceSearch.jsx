// components/VoiceSearch.jsx
import React, { useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic } from "lucide-react";
import { Button } from "./ui/button";

const VoiceSearch = ({ onVoiceResult }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript) {
      onVoiceResult(transcript);  
      resetTranscript();          
    }
  }, [listening]);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser does not support voice recognition.");
      return;
    }
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  };

  return (
    <Button onClick={startListening}  variant="secondry" className="p-2 rounded-full ">
      <Mic className="w-5 h-5" />
      <span className="sr-only">Voice Search</span>
    </Button>
  );
};

export default VoiceSearch;
