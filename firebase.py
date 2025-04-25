import requests

API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b"
HEADERS = {"Authorization": "Bearer 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"}

def query(payload):
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    return response.json()

print(query({"inputs": "Hola, ¿cómo estás?"}))

