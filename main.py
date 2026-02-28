
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
from typing import List, Optional
import time

app = FastAPI(title="Bode Sniper Simulator API")

# Habilitar CORS para o frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SniperInput(BaseModel):
    taxa_compra: float
    slippage: float
    tp_multipliers: List[float]
    capital_inicial: float
    anti_mev: bool
    n_sim: int = 1247

@app.get("/historical/{coin}/{months}")
async def get_historical(coin: str, months: int):
    """
    Simula retorno histórico baseado em médias reais de mercado.
    Em produção, usaria pycoingecko ou ccxt.
    """
    # Mock de dados baseados em volatilidade histórica BTC/ETH/SOL
    stats = {
        "btc": {"mu": 0.05, "sigma": 0.15},
        "eth": {"mu": 0.07, "sigma": 0.22},
        "sol": {"mu": 0.12, "sigma": 0.35},
        "bdc": {"mu": 0.28, "sigma": 0.45}
    }
    
    coin_key = coin.lower()
    if coin_key not in stats:
        coin_key = "bdc" # Default para ativos de alta performance
        
    s = stats[coin_key]
    # Retorno acumulado: (1 + mu)^months - 1
    total_return = (1 + s["mu"]) ** months - 1
    
    return {
        "coin": coin,
        "period_months": months,
        "average_monthly_return": s["mu"],
        "volatility": s["sigma"],
        "total_period_return_pct": round(total_return * 100, 2)
    }

@app.post("/simulate")
async def simulate(input_data: SniperInput):
    """
    Motor de Simulação de Monte Carlo usando Geometric Brownian Motion (GBM)
    """
    try:
        t_months = 36
        dt = 1 # Mensal
        n_paths = input_data.n_sim
        
        # Parâmetros de Drift (Mu) e Volatilidade (Sigma) para o Sniper
        # Para chegar em $8.5M de $1k em 36m, mu mensal ~ 28.6%
        mu = 0.286 
        sigma = 0.40 
        
        # Impacto de custos
        cost_factor = 1 + (input_data.taxa_compra + input_data.slippage)
        if input_data.anti_mev:
            # Anti-MEV reduz slippage efetivo mas adiciona uma pequena taxa fixa de bribe (Jito)
            cost_factor = 1 + (input_data.taxa_compra + (input_data.slippage * 0.2)) + 0.005
            
        # Simulação GBM vetorial: S(t) = S0 * exp((mu - 0.5*sigma**2)*t + sigma*W(t))
        t = np.arange(0, t_months + 1)
        # Matriz de choques aleatórios (Z ~ N(0,1))
        Z = np.random.standard_normal((n_paths, t_months + 1))
        W = np.cumsum(Z, axis=1) * np.sqrt(dt) # Movimento Browniano
        
        # S0 ajustado pelo custo inicial de sniper
        S0 = input_data.capital_inicial / cost_factor
        
        # Cálculo das trajetórias
        drift = (mu - 0.5 * sigma**2) * t
        diffusion = sigma * W
        paths = S0 * np.exp(drift + diffusion)
        
        # Média das simulações para a curva visual
        mean_path = np.mean(paths, axis=0)
        
        # Sucesso: Caminhos que terminam com ROI > 1
        final_values = paths[:, -1]
        success_count = np.sum(final_values > input_data.capital_inicial)
        success_rate = (success_count / n_paths) * 100
        
        # ROI Médio
        avg_final_wealth = np.mean(final_values)
        roi_total = avg_final_wealth / input_data.capital_inicial
        
        # Formatar curva para o Recharts
        curva = []
        for i, val in enumerate(mean_path):
            curva.append({
                "month": i,
                "baseAtivo": float(val),
                "yieldIncentivo": float(val * 0.22), # 22% de yield ecossistema
                "precoEstimado": float((val / 1000) * (1 + i/10)),
                "holders": int(1000 + (i * 1250))
            })
            
        return {
            "success_rate": round(success_rate, 2),
            "roi_medio": round(roi_total, 2),
            "trades_simulated": n_paths,
            "final_wealth": round(avg_final_wealth, 2),
            "curva": curva
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
