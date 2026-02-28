
export interface SniperParams {
  aporte: number;
  novosHolders: number;
  ticketMedio: number;
  qtdBDC: number;
  taxaCompra: number;
  slippage: number;
  tpMultipliers: number[];
  antiMev: boolean;
}

export interface AssetStats {
  symbol: string;
  name: string;
  qtd: number;
  valueUsd: number;
  color: string;
  icon: string;
}

export interface ChartPoint {
  month: number;
  baseAtivo: number;
  yieldIncentivo: number;
  precoEstimado: number;
  holders: number;
}

export interface SimulationResult {
  wealthProjected: number;
  netGain: number;
  roiMultiplier: number;
  roiPercentage: string;
  chartData: ChartPoint[];
  horizonStats: { label: string; value: string; pct: number }[];
}
