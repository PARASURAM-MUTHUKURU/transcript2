import os
import tempfile
from pydub import AudioSegment
import speech_recognition as sr

def transcribe_audio_segment(audio_segment: AudioSegment, recognizer: sr.Recognizer) -> str:
    """
    Transcribes an AudioSegment using SpeechRecognition.
    Reflects the 'Transcription' phase of Speaker Diarization.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav:
        temp_wav_path = temp_wav.name
        
    try:
        audio_segment.export(temp_wav_path, format="wav")
        with sr.AudioFile(temp_wav_path) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data)
                return text
            except sr.UnknownValueError:
                return ""
            except sr.RequestError as e:
                print(f"Could not request results from Speech Recognition service; {e}")
                return ""
    finally:
        if os.path.exists(temp_wav_path):
            os.remove(temp_wav_path)
