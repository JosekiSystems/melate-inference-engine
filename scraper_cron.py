import os
import io
import requests
import pandas as pd
from sqlalchemy import create_engine, text

CSV_LOCAL = "Melate.csv"
DB_FILE = "melate.db"

# Origen directo de datos continuos de Pakin
PAKIN_RAW_CSV = "https://raw.githubusercontent.com/pakinja/pakin/master/Melate.csv"

def obtener_ultimo_concurso_local():
    """Obtiene el número de concurso más alto en nuestro archivo local."""
    if not os.path.exists(CSV_LOCAL):
        return 0
    df = pd.read_csv(CSV_LOCAL)
    df.columns = df.columns.str.strip().str.upper()
    return int(df["CONCURSO"].max())

def consultar_pakin():
    """Descarga el dataset actualizado de Pakin en tiempo real."""
    print(f"[*] Conectando al feed de datos de Pakin: {PAKIN_RAW_CSV} ...")
    headers = {"User-Agent": "MelateInferenceEngine/1.0"}
    
    try:
        response = requests.get(PAKIN_RAW_CSV, headers=headers, timeout=20)
        response.raise_for_status()
        
        # Leer directamente como DataFrame
        df_remoto = pd.read_csv(io.StringIO(response.text))
        df_remoto.columns = df_remoto.columns.str.strip().str.upper()
        return df_remoto
    except Exception as e:
        print(f"[-] Error al descargar datos de Pakin: {e}")
        return None

def actualizar_sqlite(nuevos_registros_df):
    """Inserta las nuevas filas directamente en melate.db si existe."""
    if not os.path.exists(DB_FILE) or nuevos_registros_df.empty:
        return
    try:
        engine = create_engine(f"sqlite:///{DB_FILE}")
        
        # Preparar columnas que coincidan con la tabla melate_draws
        df_sql = nuevos_registros_df.copy()
        df_sql.columns = df_sql.columns.str.strip().str.lower()
        if "id" in df_sql.columns:
            df_sql.rename(columns={"id": "draw_id"}, inplace=True)
        if "primos" in df_sql.columns:
            df_sql.drop(columns=["primos"], inplace=True)

        with engine.begin() as conn:
            for _, row in df_sql.iterrows():
                conn.execute(text("""
                    INSERT OR IGNORE INTO melate_draws 
                    (concurso, draw_id, r1, r2, r3, r4, r5, r6, r7, bolsa, fecha, repetidos, media)
                    VALUES 
                    (:concurso, :draw_id, :r1, :r2, :r3, :r4, :r5, :r6, :r7, :bolsa, :fecha, :repetidos, :media)
                """), {
                    "concurso": int(row["concurso"]),
                    "draw_id": int(row["draw_id"]) if pd.notnull(row["draw_id"]) else 0,
                    "r1": int(row["r1"]), "r2": int(row["r2"]), "r3": int(row["r3"]),
                    "r4": int(row["r4"]), "r5": int(row["r5"]), "r6": int(row["r6"]),
                    "r7": int(row["r7"]),
                    "bolsa": int(row["bolsa"]),
                    "fecha": row["fecha"],
                    "repetidos": int(row.get("repetidos", 0)),
                    "media": float(row["media"])
                })
        print(f"[+] SQLite (melate.db) actualizado con {len(nuevos_registros_df)} sorteo(s) nuevo(s).")
    except Exception as e:
        print(f"[-] Advertencia al actualizar SQLite: {e}")

def ejecutar_proceso():
    concurso_local = obtener_ultimo_concurso_local()
    print(f"[*] Último concurso en nuestro CSV local: #{concurso_local}")

    df_pakin = consultar_pakin()
    if df_pakin is None or df_pakin.empty:
        print("[!] No se pudo descargar la información de Pakin.")
        return

    concurso_pakin_max = int(df_pakin["CONCURSO"].max())
    print(f"[*] Último concurso disponible en Pakin: #{concurso_pakin_max}")

    # Filtrar solo los sorteos que no tengamos localmente
    nuevos_sorteos = df_pakin[df_pakin["CONCURSO"] > concurso_local].copy()

    if nuevos_sorteos.empty:
        print(f"[i] Tu base ya está 100% al día con el concurso #{concurso_local}. Nada que actualizar.")
        return

    print(f"[+] Se encontraron {len(nuevos_sorteos)} concurso(s) nuevo(s) por incorporar.")

    # 1. Quitar 'PRIMOS' si existe
    if "PRIMOS" in nuevos_sorteos.columns:
        nuevos_sorteos.drop(columns=["PRIMOS"], inplace=True)

    # 2. Actualizar CSV local
    df_local_actual = pd.read_csv(CSV_LOCAL)
    if "PRIMOS" in df_local_actual.columns:
        df_local_actual.drop(columns=["PRIMOS"], inplace=True)

    # Concatenar nuevos arriba y guardar
    df_final = pd.concat([nuevos_sorteos, df_local_actual], ignore_index=True)
    df_final.sort_values(by="CONCURSO", ascending=False, inplace=True)
    df_final.to_csv(CSV_LOCAL, index=False)
    print(f"[+] Archivo '{CSV_LOCAL}' actualizado exitosamente con sorteo #{concurso_pakin_max}.")

    # 3. Actualizar la base SQLite
    actualizar_sqlite(nuevos_sorteos)

    print(f"[✓] Proceso terminado con éxito.")

if __name__ == "__main__":
    ejecutar_proceso()