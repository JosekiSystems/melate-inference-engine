# Melate Inference & Data Engine 🇲🇽🎲

Sistema integral de análisis probabilístico, estadística descriptiva y modelado por inferencia estocástica (Monte Carlo con muestreo por aceptación/rechazo) para el sorteo mexicano **Melate**, basado en el historial oficial de eventos.

---

## 📐 Fundamento Matemático

El espacio muestral $\Omega$ de Melate consta de todas las combinaciones sin reemplazo de 6 números tomados de un conjunto base de 56:

$$|\Omega| = \binom{56}{6} = 32,468,436$$

Aunque cada microestado individual tiene probabilidad laplaciana uniforme $P(x) = \frac{1}{|\Omega|}$, la partición del espacio mediante la variable aleatoria de suma $S(x) = \sum_{i=1}^6 r_i$ induce una distribución aproximadamente normal:
* **Región de Alta Densidad ($125 \le S(x) \le 215$):** Concentra $\approx 80\%$ de la masa probabilística.
* **Regiones Extremas:** Masa probabilística inferior al $1\%$.

El motor implementa un **muestreo Monte Carlo por Aceptación y Rechazo** condicionado a:
1. Ponderación por verosimilitud histórica (Frecuencias recientes y tiempo de rezago).
2. Filtro gaussiano de suma central.
3. Filtro de paridad hipergeométrica ($3:3$, $4:2$ o $2:4$).
4. Supresión de consecutividad excesiva.

> *Los documentos formales de derivación matemática están disponibles en formato LaTeX y PDF en el directorio `/Algoritmos`.*

---

## 🛠️ Stack Tecnológico

* **Motor de Inferencia & API:** Python 3.10+, FastAPI, NumPy, Pandas, SQLAlchemy.
* **Base de Datos:** SQLite / PostgreSQL.
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons.
* **Documentación Teórica:** LaTeX (`pdflatex`).

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/melate-inference-engine.git
cd melate-inference-engine
```

### 2. Configurar el Backend (Python)
```bash
# Instalar dependencias
pip install fastapi uvicorn pandas numpy sqlalchemy python-dotenv

# Ingerir datos históricos
python Ingestion_Script_ai_studio_code.py

# Iniciar servidor FastAPI
uvicorn FastAPI_ai_studio_code:app --reload --port 8000
```
*API y documentación interactiva disponible en: `http://localhost:8000/docs`*

### 3. Configurar el Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*Aplicación web disponible en: `http://localhost:5173`*

---

## 📄 Estructura del Proyecto

```text
├── Algoritmos/              # Papers y formalización matemática en LaTeX y PDF
├── frontend/                # Interfaz de usuario en React + Vite + Tailwind
├── Melate.csv               # Dataset histórico de sorteos
├── Ingestion_Script_...py   # Pipeline ETL para ingestión y limpieza de datos
├── Analytics_and_...py      # Motor de cálculo de frecuencias, rezagos y Monte Carlo
└── FastAPI_...py            # API REST para servir inferencias y documentos
```