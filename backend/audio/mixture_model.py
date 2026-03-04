import json
from pathlib import Path

# Load keywords from JSON
KEYWORDS_PATH = Path(__file__).parent.parent / "keywords.json"
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
