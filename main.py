from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import google.generativeai as genai

# Claves API
os.environ["GOOGLE_API_KEY"] = "TU_API_KEY_GEMINI"
WOLFRAM_APPID = "TU_API_KEY_WOLFRAM"
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

modelo_gemini = genai.GenerativeModel("models/gemini-1.5-pro-latest")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Servidor del Chatbot funcionando"}

# 🔍 Wolfram con imágenes (gráficas)
def consultar_wolframalpha(pregunta: str):
    url = "http://api.wolframalpha.com/v2/query"
    params = {
        "input": pregunta,
        "appid": WOLFRAM_APPID,
        "output": "JSON"
    }
    try:
        res = requests.get(url, params=params, timeout=5)
        data = res.json()

        for pod in data["queryresult"]["pods"]:
            if "plot" in pod["title"].lower() or "graph" in pod["title"].lower():
                subpod = pod["subpods"][0]
                return {
                    "respuesta": subpod.get("plaintext", "Aquí está tu gráfica:"),
                    "imagen": subpod["img"]["src"],
                    "fuente": "wolfram"
                }

        return {"respuesta": "No se pudo generar una gráfica", "fuente": "wolfram", "imagen": None}

    except Exception as e:
        print(f"Error consultando WolframAlpha: {e}")
        return {"respuesta": "Error al consultar WolframAlpha", "fuente": "error", "imagen": None}

# 🤖 Gemini como respaldo
def preguntar_a_gemini_enfocado(pregunta_usuario: str):
    try:
        prompt_1 = f"""Divide la siguiente pregunta en subpreguntas que estén relacionadas con la materia de cálculo vectorial. 
Si no es posible relacionarla, indícalo al final.

Pregunta: {pregunta_usuario}"""
        subpreguntas = modelo_gemini.generate_content(prompt_1).text

        prompt_2 = f"""Actúa como un profesor experto en cálculo vectorial. 
Responde las siguientes preguntas enfocándolas exclusivamente a esa materia. 
Solo responde si tienen relación. Si no, di claramente: "Esta pregunta no está relacionada con cálculo vectorial."

Preguntas:
{subpreguntas}"""
        respuesta = modelo_gemini.generate_content(prompt_2).text

        return {"respuesta": respuesta, "fuente": "gemini", "imagen": None}

    except Exception as e:
        print(f"Error con Gemini: {e}")
        return {"respuesta": "Error al obtener respuesta de Gemini", "fuente": "error", "imagen": None}

# 🌐 Endpoint principal
@app.post("/chatbot/")
async def chatbot(request: Request):
    data = await request.json()
    user_question = data.get("pregunta")

    if not user_question:
        return {"respuesta": "No se recibió ninguna pregunta", "fuente": "error"}

    # 1. Wolfram primero
    respuesta_wolfram = consultar_wolframalpha(user_question)
    if respuesta_wolfram and respuesta_wolfram["respuesta"] and respuesta_wolfram["fuente"] == "wolfram":
        return respuesta_wolfram

    # 2. Gemini como respaldo
    return preguntar_a_gemini_enfocado(user_question)

