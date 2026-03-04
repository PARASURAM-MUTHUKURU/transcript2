import os
import tempfile
from pydub import AudioSegment
import speech_recognition as sr
from pathlib import Path
import json

# Load keywords from JSON
KEYWORDS_PATH = Path(__file__).parent / "keywords.json"
try:
    with open(KEYWORDS_PATH, "r") as f:
        KEYWORDS_DATA = json.load(f)
except Exception as e:
    print(f"Warning: Could not load keywords.json: {e}")
    KEYWORDS_DATA = {"agent": [], "customer": []}

AGENT_KEYWORDS = KEYWORDS_DATA.get("agent", [])
CUSTOMER_KEYWORDS = KEYWORDS_DATA.get("customer", [])

class SpeakerMixtureModel:
    """
    Implementation of a Mixture Model for speaker role classification.
    Inspired by Speaker Diarization theory (identifying 'who spoke when'), 
    this model uses a weighted mixture of features (Keywords, Fluency, Sentiment) 
    to estimate the probability of a speaker being an Agent or a Customer.
    
    This reflects the 'Mixture Model' concept where an observation (transcript) 
    belongs to one of these subpopulations with a certain probability.
    """
    def __init__(self):
        # Mixture weights for different feature components (sum to 1)
        self.weights = {
            "keywords": 0.65,    # Keyword density is the strongest indicator
            "fluency": 0.15,     # Agent prompts tend to be longer/more fluent
            "sentiment": 0.20    # Professionalism/Politeness markers
        }

    def calculate_role_probability(self, transcript: str) -> dict:
        """
        Calculates the probability distribution over speaker roles.
        """
        if not transcript:
            return {"agent": 0.5, "customer": 0.5}
            
        t = transcript.lower()
        
        # 1. Keyword Component (Likelihood)
        agent_matches = sum(1 for k in AGENT_KEYWORDS if k in t)
        customer_matches = sum(1 for k in CUSTOMER_KEYWORDS if k in t)
        
        total_matches = agent_matches + customer_matches
        if total_matches > 0:
            # We add a small smoothing factor (Laplace smoothing-like) just to prevent exact 0s and 1s when there are matches
            p_agent_keywords = (agent_matches + 0.1) / (total_matches + 0.2)
        else:
            p_agent_keywords = 0.5 # Neutral fallback
        
        # 2. Fluency Component (Heuristic)
        words = t.split()
        # Agents usually provide longer, more structured responses in intro segments
        if len(words) > 10:
            p_agent_fluency = 0.8
        elif len(words) > 5:
            p_agent_fluency = 0.6
        else:
            p_agent_fluency = 0.3
            
        # 3. Sentiment/Professionalism Component
        professional_terms = ["please", "assist", "check", "thank you", "apologize", "understand", "patience", "moment"]
        sentiment_score = sum(1 for p in professional_terms if p in t)
        
        # Non-linear scaling for sentiment score (2 terms is very strong evidence of agent)
        p_agent_sentiment = min(0.4 + (sentiment_score * 0.3), 0.95)
        
        # Weighted Mixture Model formula
        p_agent_raw = (
            self.weights["keywords"] * p_agent_keywords +
            self.weights["fluency"] * p_agent_fluency +
            self.weights["sentiment"] * p_agent_sentiment
        )
        
        # Normalize/Constrain strictly into a probability space
        p_agent = max(0.05, min(0.95, p_agent_raw))
        
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

import numpy as np
import librosa
from sklearn.cluster import KMeans

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

def process_mono_diarization(audio_file_path: str, num_speakers: int = 2):
    """
    Process a mono audio file using true Speaker Diarization (Segmentation + Clustering).
    Extracts MFCC features, clusters them using KMeans, assigns contiguous segments to
    speakers, and then uses the SpeakerMixtureModel to assign roles (Agent vs Customer).
    """
    print(f"Loading audio file for diarization: {audio_file_path}")
    
    # 1. Feature Extraction (MFCCs)
    # Load with librosa for feature extraction
    y, sr_lib = librosa.load(audio_file_path, sr=16000)
    
    print("Extracting MFCC features...")
    # Extract Mel-frequency cepstral coefficients (MFCCs)
    # These represent the short-term power spectrum of a sound (vocal signature)
    mfccs = librosa.feature.mfcc(y=y, sr=sr_lib, n_mfcc=20, hop_length=512)
    mfccs = mfccs.T # Shape: (time_frames, n_mfcc)
    
    # Standardize features
    mfccs = (mfccs - np.mean(mfccs, axis=0)) / np.std(mfccs, axis=0)
    
    # 2. Clustering (KMeans)
    print(f"Clustering into {num_speakers} speakers using KMeans...")
    kmeans = KMeans(n_clusters=num_speakers, random_state=42, n_init=10)
    labels = kmeans.fit_predict(mfccs)
    
    # 3. Segmentation Mapping
    # Map the frame-level labels back to time segments
    frame_duration = 512 / sr_lib # Duration of one frame in seconds
    
    # Load full audio with pydub for slicing
    audio = AudioSegment.from_file(audio_file_path)
    
    # Group continuous segments by speaker ID
    segments = {0: AudioSegment.empty(), 1: AudioSegment.empty()}
    
    current_label = labels[0]
    segment_start_idx = 0
    
    # Simple smoothing to avoid micro-segments (< 0.5s)
    smoothed_labels = np.copy(labels)
    window_size = int(0.5 / frame_duration)
    for i in range(len(smoothed_labels) - window_size):
        smoothed_labels[i] = np.bincount(labels[i:i+window_size]).argmax()
        
    for i, label in enumerate(smoothed_labels):
        if label != current_label or i == len(smoothed_labels) - 1:
            segment_end_idx = i
            start_time_ms = int(segment_start_idx * frame_duration * 1000)
            end_time_ms = int(segment_end_idx * frame_duration * 1000)
            
            # Append this time chunk to the corresponding speaker's aggregate audio
            segments[current_label] += audio[start_time_ms:end_time_ms]
            
            # Reset for next segment
            current_label = label
            segment_start_idx = i
            
    # 4. Transcription of Speakers' Aggregate Audio
    recognizer = sr.Recognizer()
    
    print("Transcribing Speaker 0's detected segments...")
    speaker_0_transcript = transcribe_audio_segment(segments[0][:20000], recognizer) # Max 20s intro
    print(f"Speaker 0 Intro: '{speaker_0_transcript}'")
    
    print("Transcribing Speaker 1's detected segments...")
    speaker_1_transcript = transcribe_audio_segment(segments[1][:20000], recognizer)
    print(f"Speaker 1 Intro: '{speaker_1_transcript}'")
    
    # 5. Role Classification using the Mixture Model
    model = SpeakerMixtureModel()
    s0_probs = model.calculate_role_probability(speaker_0_transcript)
    s1_probs = model.calculate_role_probability(speaker_1_transcript)
    
    print(f"Speaker 0 Agent Probability: {s0_probs['agent']:.2f}")
    print(f"Speaker 1 Agent Probability: {s1_probs['agent']:.2f}")

    # 6. Final Assignment Logic
    if s0_probs['agent'] >= s1_probs['agent']:
        agent_id = 0
        customer_id = 1
    else:
        agent_id = 1
        customer_id = 0
        
    print(f"Final Decision: Speaker {agent_id} is Agent, Speaker {customer_id} is Customer.")
    
    return {
        "agent": {
            "speaker_id": agent_id,
            "transcript_intro": speaker_0_transcript if agent_id == 0 else speaker_1_transcript,
            "audio": segments[agent_id]
        },
        "customer": {
            "speaker_id": customer_id,
            "transcript_intro": speaker_1_transcript if customer_id == 0 else speaker_0_transcript,
            "audio": segments[customer_id]
        }
    }

if __name__ == "__main__":
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
