import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

type Fuente = "wolfram" | "gemini" | "error" | "";

interface EntradaChat {
  pregunta: string;
  respuesta: string;
  fuente: Fuente;
  imagen?: string | null;
}

export default function PinkyChatbot() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);
  const [fuente, setFuente] = useState<Fuente>("");
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState<EntradaChat[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("chat_historial");
    if (stored) {
      setHistorial(JSON.parse(stored));
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pregunta: input }),
      });

      const data = await res.json();
      setResponse(data.respuesta);
      setFuente(data.fuente);
      setImagen(data.imagen || null);

      const nuevaEntrada: EntradaChat = {
        pregunta: input,
        respuesta: data.respuesta,
        fuente: data.fuente,
        imagen: data.imagen || null,
      };

      const nuevoHistorial = [...historial, nuevaEntrada];
      setHistorial(nuevoHistorial);
      localStorage.setItem("chat_historial", JSON.stringify(nuevoHistorial));

      setInput("");
    } catch (error) {
      console.error("Error:", error);
      setResponse("No se pudo conectar con Pinky.");
      setFuente("error");
      setImagen(null);
    }

    setLoading(false);
  };

  const borrarHistorial = () => {
    localStorage.removeItem("chat_historial");
    setHistorial([]);
    setResponse("");
    setFuente("");
    setImagen(null);
  };

  const renderFuente = (fuente: Fuente) => {
    switch (fuente) {
      case "wolfram":
        return "📘 WolframAlpha";
      case "gemini":
        return "🤖 Gemini";
      case "error":
        return "⚠️ Error";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-6 space-y-4 border-t-8 border-[#800000]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-pink-200 rounded-full p-2 flex items-center justify-center">
              <img src="/pinky.png" alt="Pinky" className="w-10 h-10 rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-[#800000]">
              Pinky, tu asistente de Cálculo Vectorial
            </h1>
          </div>

          {historial.length > 0 && (
            <button
              onClick={borrarHistorial}
              className="flex items-center text-sm bg-pink-200 text-[#800000] px-3 py-1 rounded hover:bg-pink-300 transition"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Borrar historial
            </button>
          )}
        </div>

        <div className="space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#800000] shadow-inner text-[#800000]"
            placeholder="Escribe tu pregunta aquí..."
            rows={3}
          />
          <button
            onClick={handleSend}
            className="bg-[#800000] text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
          >
            {loading ? "Pensando..." : "Enviar a Pinky"}
          </button>
        </div>

        {response && (
          <div className="bg-pink-100 p-4 rounded-lg shadow-inner text-[#800000]">
            <strong>Respuesta de Pinky:</strong>
            <p className="mt-2 whitespace-pre-wrap">{response}</p>
            {imagen && <img src={imagen} alt="Gráfica" className="mt-4 rounded-lg shadow" />}
            <p className="text-sm mt-2 italic text-pink-800">
              Fuente: {renderFuente(fuente)}
            </p>
          </div>
        )}

        {historial.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-bold text-[#800000]">Historial de Preguntas</h2>
            {historial.map((item, idx) => (
              <div key={idx} className="bg-pink-50 border border-pink-200 p-3 rounded-lg">
                <p className="text-sm text-[#800000] font-semibold">❓ {item.pregunta}</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">💬 {item.respuesta}</p>
                {item.imagen && <img src={item.imagen} alt="Gráfica" className="mt-2 rounded" />}
                <p className="text-xs mt-1 text-pink-700">Fuente: {renderFuente(item.fuente)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
