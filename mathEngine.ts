
import { SniperParams, SimulationResult, ChartPoint } from './types';

const BACKEND_URL = 'http://localhost:8000';

export const simulateWealth = async (params: SniperParams): Promise<SimulationResult> => {
  try {
    const response = await fetch(`${BACKEND_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taxa_compra: params.taxaCompra / 100,
        slippage: params.slippage / 100,
        tp_multipliers: params.tpMultipliers,
        capital_inicial: params.aporte,
        anti_mev: params.antiMev,
        n_sim: 1247
      })
    });

    if (!response.ok) throw new Error('Backend offline');

    const data = await response.json();
    // Fixed mapping to correctly match the SimulationResult interface
    return {
      wealthProjected: data.final_wealth,
      netGain: data.final_wealth - params.aporte,
      roiMultiplier: data.roi_medio,
      roiPercentage: `${((data.roi_medio - 1) * 100).toFixed(2)}%`,
      chartData: data.curva,
      horizonStats: [
        { label: '12 Meses', value: `${(data.success_rate * 0.92).toFixed(2)}%`, pct: data.success_rate * 0.92 },
        { label: '24 Meses', value: `${(data.success_rate * 0.97).toFixed(2)}%`, pct: data.success_rate * 0.97 },
        { label: '36 Meses', value: `${data.success_rate.toFixed(2)}%`, pct: data.success_rate }
      ]
    };
  } catch (error) {
    console.warn("Usando motor matemático local (Backend Python não detectado)");
    return localSimulateWealth(params);
  }
};

const localSimulateWealth = (params: SniperParams): SimulationResult => {
  const months = 36;
  const chartData: ChartPoint[] = [];
  // Correctly access antiMev from params after updating type
  const baseSuccessRate = params.antiMev ? 0.87 : 0.65;
  
  // Correctly access taxaCompra and slippage from params
  const costFactor = 1 + (params.taxaCompra/100 + params.slippage/100);
  let currentWealth = params.aporte / costFactor;
  
  // High drift for BDC Simulation
  const drift = 0.286; 
  const volatility = 0.35;

  for (let m = 0; m <= months; m++) {
    const growthFactor = Math.pow(1 + drift, m);
    // Gaussian random shock approximation
    const shock = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * volatility;
    const baseAtivo = currentWealth * growthFactor * (1 + shock);
    
    chartData.push({
      month: m,
      baseAtivo: Math.floor(baseAtivo),
      yieldIncentivo: Math.floor(baseAtivo * 0.22),
      precoEstimado: (baseAtivo / 1000) * (1 + m/10),
      holders: Math.floor(1000 + (m * 1250))
    });
  }

  const finalWealth = chartData[months].baseAtivo + chartData[months].yieldIncentivo;
  const roiMultiplier = finalWealth / params.aporte;

  // Fixed mapping to correctly match the SimulationResult interface
  return {
    wealthProjected: finalWealth,
    netGain: finalWealth - params.aporte,
    roiMultiplier: roiMultiplier,
    roiPercentage: `${((roiMultiplier - 1) * 100).toFixed(2)}%`,
    chartData,
    horizonStats: [
      { label: '12 Meses', value: `${(baseSuccessRate * 82).toFixed(2)}%`, pct: baseSuccessRate * 82 },
      { label: '24 Meses', value: `${(baseSuccessRate * 91).toFixed(2)}%`, pct: baseSuccessRate * 91 },
      { label: '36 Meses', value: `${(baseSuccessRate * 100).toFixed(2)}%`, pct: baseSuccessRate * 100 }
    ]
  };
};
