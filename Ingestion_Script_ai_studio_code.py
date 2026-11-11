import os
import pandas as pd
from sqlalchemy import create_engine, text

# SQLite local database file
DB_URL = "sqlite:///melate.db"
engine = create_engine(DB_URL)

def seed_from_csv(csv_path="Melate.csv"):
    if not os.path.exists(csv_path):
        print(f"[-] CSV file not found at: {csv_path}")
        return

    print(f"[*] Reading {csv_path}...")
    df = pd.read_csv(csv_path)

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower()
    df.rename(columns={'id': 'draw_id'}, inplace=True)

    # Remove PRIMOS column
    if 'primos' in df.columns:
        df.drop(columns=['primos'], inplace=True)

    # Sort ascending
    df.sort_values(by="concurso", ascending=True, inplace=True)

    # Load directly into SQLite
    df.to_sql("melate_draws", engine, if_exists="replace", index=False)

    # Create index on concurso
    with engine.begin() as conn:
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_concurso ON melate_draws(concurso);"))

    print(f"[+] Loaded {len(df)} draws successfully into local SQLite database (melate.db)!")

if __name__ == "__main__":
    seed_from_csv()