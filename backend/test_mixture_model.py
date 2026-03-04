from audio_processor import SpeakerMixtureModel

def test_model():
    model = SpeakerMixtureModel()
    
    agent_text = "Thank you for calling customer service. This is Sarah, how can I help you today?"
    customer_text = "I have an issue with my recent order, it is broken and I need a refund."
    neutral_text = "Hello, I am looking for some information."

    print(f"Agent Text Probs: {model.calculate_role_probability(agent_text)}")
    print(f"Customer Text Probs: {model.calculate_role_probability(customer_text)}")
    print(f"Neutral Text Probs: {model.calculate_role_probability(neutral_text)}")

if __name__ == "__main__":
    test_model()
