import os
import tempfile
from pydub import AudioSegment
import speech_recognition as sr
from pathlib import Path

import json

# Load keywords from JSON
KEYWORDS_PATH = Path(__file__).parent / "keywords.json"
with open(KEYWORDS_PATH, "r") as f:
    KEYWORDS_DATA = json.load(f)

AGENT_KEYWORDS = KEYWORDS_DATA.get("agent", [])
CUSTOMER_KEYWORDS = KEYWORDS_DATA.get("customer", [])

class SpeakerMixtureModel:
    """
    A conceptual implementation of a Mixture Model for speaker role classification.
    Instead of hard rules, it uses a weighted mixture of features.
    """
    def __init__(self):
        self.weights = {
            "keywords": 0.6,
            "fluency": 0.2,
            "sentiment": 0.2
        }

    def calculate_role_probability(self, transcript: str) -> dict:
        t = transcript.lower()
        
        # 1. Keyword Component
        agent_matches = sum(1 for k in AGENT_KEYWORDS if k in t)
        customer_matches = sum(1 for k in CUSTOMER_KEYWORDS if k in t)
        
        # Relative scoring for keywords
        total_matches = agent_matches + customer_matches
        if total_matches > 0:
            p_agent_keywords = agent_matches / total_matches
        else:
            p_agent_keywords = 0.5 # Neutral if no matches
        
        # 2. Fluency Component
        words = t.split()
        p_agent_fluency = 0.7 if len(words) > 5 else 0.4
        
        # 3. Sentiment/Professionalism Component (Placeholder logic)
        professional_terms = ["please", "assist", "check", "thank you"]
        sentiment_score = sum(1 for p in professional_terms if p in t)
        p_agent_sentiment = min(sentiment_score / 2.0, 1.0)
        
        # Weighted Mixture
        p_agent = (
            self.weights["keywords"] * p_agent_keywords +
            self.weights["fluency"] * p_agent_fluency +
            self.weights["sentiment"] * p_agent_sentiment
        )
        
        return {
            "agent": p_agent,
            "customer": 1.0 - p_agent
        }

def classify_role(transcript: str) -> str:
    """
    Classify the role using the SpeakerMixtureModel.
    """
    model = SpeakerMixtureModel()
    probs = model.calculate_role_probability(transcript)
    return "agent" if probs["agent"] > probs["customer"] else "customer"

def transcribe_audio_segment(audio_segment: AudioSegment, recognizer: sr.Recognizer) -> str:
    """
    Transcribes an AudioSegment using SpeechRecognition.
    """
    # Export the segment to a temporary WAV file to be read by SpeechRecognition
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav:
        temp_wav_path = temp_wav.name
        
    try:
        audio_segment.export(temp_wav_path, format="wav")
        with sr.AudioFile(temp_wav_path) as source:
            audio_data = recognizer.record(source)
            # Using Google Web Speech API for simplicity (requires internet, no API key needed for basic use)
            # Replace with whisper if desired: recognizer.recognize_whisper(audio_data)
            try:
                text = recognizer.recognize_google(audio_data)
                return text
            except sr.UnknownValueError:
                return ""
            except sr.RequestError as e:
                print(f"Could not request results from Speech Recognition service; {e}")
                return ""
    finally:
        os.remove(temp_wav_path)

def process_stereo_call(audio_file_path: str, intro_seconds: int = 8):
    """
    Process a stereo audio file to determine which channel is the agent and which is the customer.
    
    Returns:
        dict: A mapping of channel indices or roles to their detected information.
    """
    print(f"Loading audio file: {audio_file_path}")
    audio = AudioSegment.from_file(audio_file_path)
    
    if audio.channels != 2:
        raise ValueError(f"Expected a stereo audio file, but got {audio.channels} channels.")
    
    # 1. Split stereo channels
    left_channel = audio.split_to_mono()[0]
    right_channel = audio.split_to_mono()[1]
    
    # 2. Transcribe first few seconds
    def trim_audio(audio_segment, seconds):
        return audio_segment[:seconds * 1000]
        
    left_intro = trim_audio(left_channel, intro_seconds)
    right_intro = trim_audio(right_channel, intro_seconds)
    
    recognizer = sr.Recognizer()
    
    print("Transcribing left channel intro...")
    left_transcript = transcribe_audio_segment(left_intro, recognizer)
    print(f"Left Transcript: '{left_transcript}'")
    
    print("Transcribing right channel intro...")
    right_transcript = transcribe_audio_segment(right_intro, recognizer)
    print(f"Right Transcript: '{right_transcript}'")
    
    # 3. Role classification
    left_role = classify_role(left_transcript)
    right_role = classify_role(right_transcript)
    
    # 4. Decide final mapping
    # Handle conflicts: If both are classified as customer or both as agent
    if left_role == right_role:
        print("Warning: Both channels got the same role classification based on keywords. Defaulting Left=Agent, Right=Customer.")
        left_role = "agent"
        right_role = "customer"
    
    if left_role == "agent":
        agent_channel = 0
        customer_channel = 1
        agent_audio = left_channel
        customer_audio = right_channel
    else:
        agent_channel = 1
        customer_channel = 0
        agent_audio = right_channel
        customer_audio = left_channel
        
    print(f"Final Decision: Channel {agent_channel} is Agent, Channel {customer_channel} is Customer.")
    
    return {
        "agent": {
            "channel_index": agent_channel,
            "transcript_intro": left_transcript if agent_channel == 0 else right_transcript,
            "audio": agent_audio
        },
        "customer": {
            "channel_index": customer_channel,
            "transcript_intro": right_transcript if customer_channel == 0 else left_transcript,
            "audio": customer_audio
        }
    }

if __name__ == "__main__":
    # Example usage / Test block
    # Note: Requires a valid stereo audio file to test.
    import sys
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        if os.path.exists(test_file):
            result = process_stereo_call(test_file)
            print("Processing complete.")
            print(f"Agent intro: {result['agent']['transcript_intro']}")
            print(f"Customer intro: {result['customer']['transcript_intro']}")
        else:
            print(f"File not found: {test_file}")
    else:
        print("Provide a path to a stereo audio file to test.")
        print("Usage: python audio_processor.py <path_to_audio_file>")
