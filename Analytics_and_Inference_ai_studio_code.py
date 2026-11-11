import numpy as np
import pandas as pd
from typing import List, Dict, Any

class MelateInferenceEngine:
    def __init__(self, db_engine):
        self.engine = db_engine

    def load_draws(self, limit: int = None) -> pd.DataFrame:
        """Loads historical draws sorted descending by concurso."""
        query = "SELECT * FROM melate_draws ORDER BY concurso DESC"
        if limit:
            query += f" LIMIT {limit}"
        return pd.read_sql(query, self.engine)

    def get_frequency_and_delays(self, window: int = 100) -> Dict[str, Any]:
        """Calculates frequency and delay (rezago) for numbers 1 to 56."""
        df = self.load_draws()
        if df.empty:
            return {}

        total_draws = len(df)
        window_df = df.head(window)

        ball_cols = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']
        window_balls = window_df[ball_cols].values.flatten()
        all_balls = df[ball_cols].values

        freq_counts = pd.Series(window_balls).value_counts().to_dict()

        stats = []
        for num in range(1, 57):
            freq = freq_counts.get(num, 0)
            delay = 0
            found = False
            for row in all_balls:
                if num in row:
                    found = True
                    break
                delay += 1
            if not found:
                delay = total_draws

            stats.append({
                "number": num,
                "frequency": freq,
                "delay": delay
            })

        sorted_by_freq = sorted(stats, key=lambda x: x['frequency'], reverse=True)
        sorted_by_delay = sorted(stats, key=lambda x: x['delay'], reverse=True)

        return {
            "window": window,
            "total_records": total_draws,
            "hot_numbers": sorted_by_freq[:10],
            "cold_numbers": sorted_by_freq[-10:],
            "most_delayed": sorted_by_delay[:10],
            "all_stats": stats
        }

    def generate_candidate_combinations(
        self, 
        count: int = 5, 
        strategy: str = "balanced", 
        sum_min: int = 125, 
        sum_max: int = 215
    ) -> List[Dict[str, Any]]:
        """
        Generates candidate combinations using historical distribution rules:
        - 6 unique numbers in [1, 56]
        - Sum falls inside standard historical bell-curve (sum_min to sum_max)
        - Parity ratio (odd/even) is balanced (2:4, 3:3, or 4:2)
        - Excludes long consecutive chains
        """
        freq_info = self.get_frequency_and_delays(window=100)
        all_stats = freq_info.get("all_stats", [])
        
        numbers = np.arange(1, 57)
        weights = np.ones(56)

        if all_stats and strategy in ["hot", "cold", "balanced"]:
            freq_map = {item['number']: item['frequency'] for item in all_stats}
            delay_map = {item['number']: item['delay'] for item in all_stats}

            if strategy == "hot":
                weights = np.array([freq_map.get(n, 1) + 1 for n in numbers], dtype=float)
            elif strategy == "cold":
                weights = np.array([delay_map.get(n, 1) + 1 for n in numbers], dtype=float)
            elif strategy == "balanced":
                weights = np.array([
                    (freq_map.get(n, 1) * 0.5) + (delay_map.get(n, 1) * 0.5) + 1 
                    for n in numbers
                ], dtype=float)

        weights = weights / weights.sum()

        candidates = []
        max_attempts = 10000
        attempts = 0

        while len(candidates) < count and attempts < max_attempts:
            attempts += 1
            sample = np.random.choice(numbers, size=6, replace=False, p=weights)
            sample.sort()

            total_sum = int(sample.sum())
            if not (sum_min <= total_sum <= sum_max):
                continue

            odd_count = int(sum(1 for x in sample if x % 2 != 0))
            if odd_count not in [2, 3, 4]:
                continue

            diffs = np.diff(sample)
            if sum(1 for d in diffs if d == 1) >= 3:
                continue

            candidate_obj = {
                "combination": [int(x) for x in sample],
                "sum": total_sum,
                "mean": round(float(total_sum / 6.0), 1),
                "odd_even_ratio": f"{odd_count}:{6 - odd_count}",
                "strategy": strategy
            }

            if candidate_obj not in candidates:
                candidates.append(candidate_obj)

        return candidates