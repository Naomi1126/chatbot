# Pinky Chatbot - Backend FastAPI

Este backend responde preguntas relacionadas con Cálculo Vectorial utilizando dos fuentes:
- 📘 WolframAlpha (gráficas y cálculos exactos)
- 🤖 Gemini (modelo de lenguaje contextual)

## Despliegue

1. Subir este repo a GitHub
2. En Render:
   - New Web Service
   - Python runtime
   - Start command:
     ```
     uvicorn main:app --host 0.0.0.0 --port 10000
     ```
   - Variables de entorno necesarias:
     - `GOOGLE_API_KEY`
     - `WOLFRAM_APPID`

Una vez desplegado, Render te dará una URL como:
