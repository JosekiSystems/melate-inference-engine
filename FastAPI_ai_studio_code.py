import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, text

from Analytics_and_Inference_ai_studio_code import MelateInferenceEngine

app = FastAPI(
    title="Melate Inference API",
    description="Analytics and candidate inference for Mexican Melate",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_URL = "sqlite:///melate.db"
engine = create_engine(DB_URL)
inference_service = MelateInferenceEngine(engine)

# Ruta a la carpeta de PDFs
ALGORITMOS_DIR = os.path.join(os.path.dirname(__file__), "Algoritmos")

@app.get("/health")
def health_check():
    return {"status": "online", "database": "sqlite", "service": "melate-inference-engine"}

@app.get("/api/v1/draws/latest")
def get_latest_draw():
    """Returns the latest Melate draw."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM melate_draws ORDER BY concurso DESC LIMIT 1")).mappings().first()
        if not result:
            raise HTTPException(status_code=404, detail="No draws found. Run the ingestion script first.")
        return dict(result)

@app.get("/api/v1/analytics/frequency")
def get_frequency_analytics(window: int = Query(default=100, ge=10, le=1000)):
    """Returns hot, cold, and delay statistics."""
    return inference_service.get_frequency_and_delays(window=window)

@app.get("/api/v1/inference/predict")
def predict_combinations(
    count: int = Query(default=3, ge=1, le=20),
    strategy: str = Query(default="balanced", regex="^(hot|cold|balanced)$")
):
    """Generates candidate combinations based on selected strategy."""
    candidates = inference_service.generate_candidate_combinations(count=count, strategy=strategy)
    return {
        "count_generated": len(candidates),
        "strategy": strategy,
        "recommendations": candidates
    }

# NUEVO: Endpoint para servir los PDFs de la carpeta Algoritmos
@app.get("/api/v1/docs/pdf/{doc_name}")
def get_math_pdf(doc_name: str):
    """Permite previsualizar o descargar los documentos PDF matemáticos."""
    pdf_catalog = {
        "probabilidad": "algoritmodeprobabilidaduno.pdf",
        "montecarlo": "montecarlo.pdf"
    }

    if doc_name not in pdf_catalog:
        raise HTTPException(status_code=404, detail="Documento no reconocido.")

    file_path = os.path.join(ALGORITMOS_DIR, pdf_catalog[doc_name])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"El archivo {pdf_catalog[doc_name]} no se encontró en la carpeta Algoritmos.")

    # Se sirve con inline para que el navegador lo abra directamente en una pestaña
    return FileResponse(
        file_path, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"inline; filename={pdf_catalog[doc_name]}"}
    )