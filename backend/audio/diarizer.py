import numpy as np
import librosa
from sklearn.cluster import KMeans
from pydub import AudioSegment
import speech_recognition as sr

from .transcriber import transcribe_audio_segment
from .mixture_model import SpeakerMixtureModel

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
