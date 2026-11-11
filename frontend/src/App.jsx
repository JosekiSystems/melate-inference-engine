import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Snowflake, 
  Clock, 
  RefreshCw, 
  Lock, 
  Unlock, 
  UserCheck, 
  CheckCircle2, 
  X,
  Zap,
  BarChart3,
  BrainCircuit,
  BookOpen,
  FileText,
  ExternalLink
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

function LotteryBall({ number, isSpecial = false, size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs font-bold",
    md: "w-11 h-11 text-sm font-extrabold",
    lg: "w-13 h-13 text-base font-black shadow-lg"
  }[size];

  const getGradient = (num, special) => {
    if (special) return "from-red-600 to-rose-900 border-red-400 text-white shadow-red-500/50";
    if (num <= 10) return "from-amber-400 to-amber-600 border-amber-300 text-black";
    if (num <= 20) return "from-blue-500 to-blue-700 border-blue-300 text-white";
    if (num <= 30) return "from-emerald-500 to-emerald-700 border-emerald-300 text-white";
    if (num <= 40) return "from-purple-500 to-purple-700 border-purple-300 text-white";
    return "from-orange-500 to-red-600 border-orange-300 text-white";
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center border-2 shadow-md bg-gradient-to-b ${getGradient(
        number,
        isSpecial
      )} ${sizeClasses} transform transition-transform hover:scale-105`}
    >
      {number}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("inferencia"); // 'inferencia' | 'descripcion' | 'teoria'
  const [latestDraw, setLatestDraw] = useState(null);
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [strategy, setStrategy] = useState("balanced");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [freeGenerationsLeft, setFreeGenerationsLeft] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchLatestDraw();
    fetchStats();
  }, []);

  const fetchLatestDraw = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/draws/latest`);
      const data = await res.json();
      setLatestDraw(data);
    } catch (err) {
      console.error("Error al cargar último sorteo:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/frequency?window=100`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };

  const handleGenerateClick = () => {
    if (!isLoggedIn && freeGenerationsLeft <= 0) {
      setShowAuthModal(true);
      return;
    }
    if (!isLoggedIn && (strategy !== "balanced" || count > 1)) {
      setShowAuthModal(true);
      return;
    }
    executePrediction();
  };

  const executePrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/inference/predict?count=${count}&strategy=${strategy}`);
      const data = await res.json();
      setPredictions(data.recommendations || []);

      if (!isLoggedIn) {
        setFreeGenerationsLeft((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error al generar jugadas:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500">
              MELATE DATA ENGINE
            </span>
            {isLoggedIn ? (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> PRO Activo
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/30 font-bold">
                Prueba ({freeGenerationsLeft} jugada restante)
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Espacio Muestral |Ω| = 32,468,436 combinaciones analizadas
          </p>
        </div>

        {/* SIMULADOR LOGIN */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsLoggedIn(!isLoggedIn);
              if (!isLoggedIn) {
                setFreeGenerationsLeft(999);
              } else {
                setFreeGenerationsLeft(1);
                setCount(1);
                setStrategy("balanced");
              }
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 py-2 px-3.5 rounded-xl transition-all"
          >
            {isLoggedIn ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
            {isLoggedIn ? "Modo Visitante" : "Simular PRO"}
          </button>
        </div>
      </header>

      {/* NAVEGACIÓN */}
      <nav className="max-w-6xl mx-auto mt-6 flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("inferencia")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "inferencia"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Inferencia (Monte Carlo)
        </button>

        <button
          onClick={() => setActiveTab("descripcion")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "descripcion"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Descripción (Evidencia Histórica)
        </button>

        <button
          onClick={() => setActiveTab("teoria")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "teoria"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Fundamento Matemático & Papers
        </button>
      </nav>

      <main className="max-w-6xl mx-auto mt-6 space-y-6">
        {/* BANNER ÚLTIMO SORTEO */}
        {latestDraw && (
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                Último Evento Registrado: Concurso #{latestDraw.concurso}
              </span>
              <p className="text-slate-400 text-xs mt-2">Fecha: {latestDraw.fecha} | Bolsa: ${Number(latestDraw.bolsa).toLocaleString('es-MX')} MXN</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[latestDraw.r1, latestDraw.r2, latestDraw.r3, latestDraw.r4, latestDraw.r5, latestDraw.r6].map((num, i) => (
                <LotteryBall key={i} number={num} size="sm" />
              ))}
              <div className="h-6 w-px bg-slate-700 mx-1"></div>
              <LotteryBall number={latestDraw.r7} isSpecial={true} size="sm" />
            </div>
          </section>
        )}

        {/* ---------------- PESTAÑA 1: INFERENCIA ---------------- */}
        {activeTab === "inferencia" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold">Muestreo Estocástico por Aceptación y Rechazo</h2>
                </div>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  Filtros: Gaussiana (125 ≤ Suma ≤ 215) + Paridad Balanceada
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Estrategia de Ponderación</label>
                  <select
                    value={strategy}
                    onChange={(e) => {
                      if (!isLoggedIn && e.target.value !== "balanced") {
                        setShowAuthModal(true);
                      } else {
                        setStrategy(e.target.value);
                      }
                    }}
                    className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="balanced">Equilibrada (Frecuencia + Rezago)</option>
                    <option value="hot">🔥 Caliente (Alta Frecuencia) - PRO</option>
                    <option value="cold">❄️ Fría (Máximo Rezago) - PRO</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Número de Candidatos</label>
                  <select
                    value={count}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isLoggedIn && val > 1) {
                        setShowAuthModal(true);
                      } else {
                        setCount(val);
                      }
                    }}
                    className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={1}>1 Candidato (Gratis)</option>
                    <option value={3}>3 Candidatos (PRO)</option>
                    <option value={5}>5 Candidatos (PRO)</option>
                    <option value={10}>10 Candidatos (PRO)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleGenerateClick}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Muestreando...' : 'Ejecutar Inferencia'}
                  </button>
                </div>
              </div>

              {predictions.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase">Candidatos filtrados de alta densidad probabilística:</h3>
                  {predictions.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-900 w-6 h-6 rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex gap-2">
                          {p.combination.map((ball) => (
                            <LotteryBall key={ball} number={ball} size="sm" />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-5 text-xs text-slate-400">
                        <div>Variable Suma S(x): <span className="font-bold text-emerald-400">{p.sum}</span></div>
                        <div>Media x̄: <span className="font-bold text-slate-200">{p.mean}</span></div>
                        <div>Par:Impar: <span className="font-bold text-indigo-400">{p.odd_even_ratio}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 2: DESCRIPCIÓN ---------------- */}
        {activeTab === "descripcion" && stats && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <BarChart3 className="w-5 h-5" />
                <h2 className="text-base font-bold">Estadística Descriptiva del Historial D</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Este módulo describe exhaustivamente lo que ya ha ocurrido en los sorteos analizados (N = {stats.total_records}).
                Calcula las frecuencias observadas y los rezagos acumulados de cada número en el conjunto base S = &#123;1, ..., 56&#125;.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-amber-400">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-sm">Mayor Frecuencia Empírica (Hot)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.hot_numbers?.map((item) => (
                    <div key={item.number} className="flex flex-col items-center">
                      <LotteryBall number={item.number} size="sm" />
                      <span className="text-[10px] text-slate-400 mt-1">{item.frequency}x</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-blue-400">
                  <Snowflake className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-sm">Menor Frecuencia Empírica (Cold)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.cold_numbers?.map((item) => (
                    <div key={item.number} className="flex flex-col items-center">
                      <LotteryBall number={item.number} size="sm" />
                      <span className="text-[10px] text-slate-400 mt-1">{item.frequency}x</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-purple-400">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-sm">Mayor Retardo / Delay</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.most_delayed?.map((item) => (
                    <div key={item.number} className="flex flex-col items-center">
                      <LotteryBall number={item.number} size="sm" />
                      <span className="text-[10px] text-slate-400 mt-1">hace {item.delay}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 3: TEORÍA & DOCUMENTOS PDF ---------------- */}
        {activeTab === "teoria" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-lg font-bold">Fundamento Matemático & Documentación LaTeX</h2>
              </div>
              <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                Documentos compilados en PDF
              </span>
            </div>

            {/* SECCIÓN ACCESO DIRECTO A LOS PAPERS EN PDF */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Documentación Formal del Algoritmo (Descargar o Leer en Línea):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PDF 1: Algoritmo de Probabilidad Uno */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Algoritmo de Probabilidad I</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Archivo: <code className="text-indigo-300">algoritmodeprobabilidaduno.pdf</code>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        Formalización del espacio muestral Ω, variables aleatorias de partición y ecuaciones teóricas.
                      </p>
                    </div>
                  </div>
                  <a
                    href={`${API_BASE}/api/v1/docs/pdf/probabilidad`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir PDF en Nueva Pestaña
                  </a>
                </div>

                {/* PDF 2: Simulación Monte Carlo */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Simulación Monte Carlo</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Archivo: <code className="text-amber-300">montecarlo.pdf</code>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        Muestreo estocástico por aceptación/rechazo, convergencia y filtrado hipervolumétrico.
                      </p>
                    </div>
                  </div>
                  <a
                    href={`${API_BASE}/api/v1/docs/pdf/montecarlo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-amber-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir PDF en Nueva Pestaña
                  </a>
                </div>
              </div>
            </div>

            {/* RESUMEN TEÓRICO EN PANTALLA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-indigo-400 mb-2">1. El Espacio Muestral Ω</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Combinaciones sin repetición de 6 números tomados de 56:
                </p>
                <div className="bg-slate-900 p-3 rounded-lg text-center font-mono text-sm text-amber-300 border border-slate-800">
                  |Ω| = C(56, 6) = 32,468,436
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  P(x) = 1 / 32,468,436 para cualquier combinación individual.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-rose-400 mb-2">2. Partición por Variable S(x)</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Densidad de probabilidad de los subconjuntos inducidos por la suma:
                </p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between bg-slate-900 p-2 rounded">
                    <span>Región Central (125 ≤ S ≤ 215):</span>
                    <strong className="text-emerald-400">~80% de masa</strong>
                  </div>
                  <div className="flex justify-between bg-slate-900 p-2 rounded">
                    <span>Regiones Extremas (&lt;80 ó &gt;260):</span>
                    <strong className="text-rose-400">&lt;1% de masa</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PAYWALL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-100">Desbloquea el Acceso PRO</h3>
              <p className="text-slate-400 text-xs mt-1.5 px-4">
                Has utilizado tu crédito de prueba. Inicia sesión para continuar muestreando combinaciones.
              </p>
            </div>

            <div className="space-y-3 my-6 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Generación ilimitada de combinaciones</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Estrategias exclusivas (Caliente / Fría / Rezago)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Acceso ilimitado a documentación teórica y simulador</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  setFreeGenerationsLeft(999);
                  setShowAuthModal(false);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Iniciar Sesión (Simulador PRO)
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full bg-transparent hover:bg-slate-800 text-slate-400 py-2.5 rounded-xl text-xs"
              >
                Seguir explorando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}