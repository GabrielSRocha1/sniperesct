
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, TrendingUp, Zap, Info } from 'lucide-react';

const App: React.FC = () => {
  // 1. INPUTS EDITÁVEIS (REGRAS RÍGIDAS DE SIMULAÇÃO)
  const [aporte, setAporte] = useState(1000);
  const [holders, setHolders] = useState(1000);
  const [ticket, setTicket] = useState(1000);

  // 2. DADOS DE MERCADO LIVE (ORACLE DE ESTADO - VERSÃO ESTÁVEL)
  const [marketCap, setMarketCap] = useState(42000);
  const [supply, setSupply] = useState(600000000); // Ajustado para 600M conforme solicitado
  const [bdcPrice, setBdcPrice] = useState(0.00042);

  const [prices, setPrices] = useState({
    bitcoin: 89360,
    ethereum: 2940.54,
    solana: 128.08
  });

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // 3. INTEGRAÇÃO APIs REAL-TIME (SYNC TOTAL 10S)
  const fetchPrices = async () => {
    try {
      // BDC Oracle - DexScreener (Contrato: AeAQdgjGqtHErysb5FBvUxNxmob2mVBGnEXdmULJ7dH9)
      const bdcResponse = await fetch('https://api.dexscreener.com/latest/dex/tokens/AeAQdgjGqtHErysb5FBvUxNxmob2mVBGnEXdmULJ7dH9');
      const bdcData = await bdcResponse.json();

      if (bdcData.pairs && bdcData.pairs[0]) {
        const pair = bdcData.pairs[0];
        const price = parseFloat(pair.priceUsd);
        if (!isNaN(price)) {
          setBdcPrice(price);
          // O Supply é fixado em 600.000.000 para a simulação de tokenomics
          const fixedSupply = 600000000;
          setSupply(fixedSupply);
          // O Market Cap é calculado com base no preço real e no supply fixo de 600M
          const currentMC = price * fixedSupply;
          setMarketCap(currentMC);
        }
      }

      // Market Oracle - CoinGecko (BTC, ETH, SOL)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
      const data = await response.json();
      if (data.bitcoin) {
        setPrices({
          bitcoin: data.bitcoin.usd,
          ethereum: data.ethereum.usd,
          solana: data.solana.usd
        });
      }
    } catch (error) {
      console.warn('Oracle offline. Utilizando cache.');
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const isActive = aporte > 0;

  // 4. MOTOR MATEMÁTICO (LOGICA DE PROJEÇÃO v8.0.0 - FÓRMULA SNIPER)
  const getStatsAtMonth = (m: number) => {
    if (!isActive) return { total: 0, base: 0, yieldVal: 0, price: 0, mcap: 0, holdersCount: 0 };

    // --- CONFIGURAÇÃO DA FÓRMULA SNIPER (BDC BENCHMARK - 12,000% GAIN) ---
    const MULTIPLICADOR_BNB = 120;
    const ALVO_CONVERSAO = 36000;

    // No simulador, meta de usuários é o crescimento projetado ao longo dos meses
    const currentHolders = holders * m;

    // Fator de Intensidade da Comunidade (Quanto mais perto dos 15k, mais próximo do ROI da BNB)
    const fatorComunidade = currentHolders / ALVO_CONVERSAO;

    // Preço Projetado baseado no potencial histórico da BNB
    const precoProjetado = bdcPrice * (1 + (MULTIPLICADOR_BNB * fatorComunidade));

    // Cálculo de Market Cap comparativo
    const marketCapProjetado = precoProjetado * supply;

    // Patrimônio Total (ROI + 2.1% Staking Yield mensal)
    const tokensIniciais = aporte / bdcPrice;
    const yieldFactor = Math.pow(1.021, m);
    const finalWealth = (tokensIniciais * yieldFactor) * precoProjetado;

    const baseVal = tokensIniciais * precoProjetado;
    const yieldIncentivo = finalWealth - baseVal;

    return {
      total: finalWealth,
      base: baseVal,
      yieldVal: yieldIncentivo,
      price: precoProjetado,
      mcap: marketCapProjetado,
      holdersCount: currentHolders
    };
  };

  const finalBdc = getStatsAtMonth(36);
  const patrimonioProjetadoTotal = finalBdc.total;
  const ganhoLiquido = Math.max(0, patrimonioProjetadoTotal - aporte);
  const roiMultiplierValue = isActive && aporte > 0 ? (patrimonioProjetadoTotal / aporte) : 0;

  const calculateRowStats = (name: string) => {
    if (!isActive) return { vStr: "0% | 0% | 0%", eStr: "$0 | $0 | $0", roi: "0.00%", m12v: 0, m24v: 0, m36v: 0 };

    let m12, m24, m36;
    if (name === 'BDC') {
      m12 = getStatsAtMonth(12).total;
      m24 = getStatsAtMonth(24).total;
      m36 = finalBdc.total;
    } else if (name === 'SOL') {
      m12 = aporte * 1.45; m24 = aporte * 2.20; m36 = aporte * 3.20;
    } else if (name === 'ETH') {
      m12 = aporte * 1.30; m24 = aporte * 1.65; m36 = aporte * 1.80;
    } else { // BTC
      m12 = aporte * 1.25; m24 = aporte * 1.55; m36 = aporte * 2.10;
    }

    const vStr = `+${(((m12 / aporte) - 1) * 100).toFixed(0)}% | +${(((m24 / aporte) - 1) * 100).toFixed(0)}% | +${(((m36 / aporte) - 1) * 100).toFixed(0)}%`;
    const eStr = `$${m12.toLocaleString(undefined, { maximumFractionDigits: 0 })} | $${m24.toLocaleString(undefined, { maximumFractionDigits: 0 })} | $${m36.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const roi = (m36 / aporte) > 100 ? `${(m36 / aporte).toFixed(0)}x` : `${(((m36 / aporte) - 1) * 100).toFixed(2)}%`;

    return { vStr, eStr, roi, m12v: m12, m24v: m24, m36v: m36 };
  };

  const bdcRow = calculateRowStats('BDC');
  const bronzeValStr = `$ ${bdcRow.m12v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const prataValStr = `$ ${bdcRow.m24v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const ouroValStr = `$ ${patrimonioProjetadoTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const bronzePct = isActive ? Math.min(100, (bdcRow.m12v / patrimonioProjetadoTotal) * 100) : 0;
  const prataPct = isActive ? Math.min(100, (bdcRow.m24v / patrimonioProjetadoTotal) * 100) : 0;
  const ouroPct = isActive ? 100 : 0;

  // 5. CHART ENGINE
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const isMobile = window.innerWidth < 768;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    const labels = Array.from({ length: 37 }, (_, i) => i.toString());
    const simulationData = labels.map((_, i) => getStatsAtMonth(i));
    const totalPortfolioData = simulationData.map(d => d.total);
    const baseAtivoData = simulationData.map(d => d.base);
    const yieldData = simulationData.map(d => d.yieldVal);
    const precoData = simulationData.map(d => d.price);
    const holdersGrowthData = simulationData.map(d => d.holdersCount);

    const getOrCreateTooltip = (chart: any) => {
      let tooltipEl = chart.canvas.parentNode.querySelector('div.custom-tooltip');
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.classList.add('custom-tooltip');
        tooltipEl.style.background = 'rgba(10, 10, 10, 0.98)';
        tooltipEl.style.borderRadius = '24px';
        tooltipEl.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        tooltipEl.style.color = 'white';
        tooltipEl.style.opacity = 0;
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.zIndex = '100';
        tooltipEl.style.padding = isMobile ? '8px' : '20px';
        tooltipEl.style.boxShadow = '0 30px 60px rgba(0,0,0,0.9)';
        tooltipEl.style.transition = 'opacity 0.2s ease, transform 0.1s ease';
        tooltipEl.style.width = isMobile ? '180px' : '320px';
        chart.canvas.parentNode.appendChild(tooltipEl);
      }
      return tooltipEl;
    };

    const externalTooltipHandler = (context: any) => {
      const { chart, tooltip } = context;
      const tooltipEl = getOrCreateTooltip(chart);
      if (tooltip.opacity === 0) { tooltipEl.style.opacity = 0; return; }
      if (tooltip.body) {
        const titleLines = tooltip.title || [];
        const dataMap: any = {};
        tooltip.dataPoints.forEach((dp: any) => { dataMap[dp.dataset.label] = dp.raw; });
        const month = titleLines[0] || '0';
        const baseAtivo = dataMap['BASE DO ATIVO'] || 0;
        const yieldIncentivo = dataMap['YIELD ALPHA'] || 0;
        const total = baseAtivo + yieldIncentivo;
        const realPrice = dataMap['PREÇO PROJETADO'] || 0;
        const holdersCount = dataMap['HOLDERS TOTAIS'] || 0;
        const fontSizeLabel = isMobile ? '8px' : '10px';
        const fontSizeValue = isMobile ? '11px' : '13px';
        const fontSizeTotal = isMobile ? '16px' : '22px';

        tooltipEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: ${isMobile ? '6px' : '10px'}; margin-bottom: ${isMobile ? '8px' : '12px'};">
            <span style="font-family: Montserrat; font-weight: 500; font-size: ${isMobile ? '9px' : '11px'}; color: #888; text-transform: uppercase;">MÊS ${month}</span>
            <span style="font-family: Montserrat; font-weight: 900; font-size: ${isMobile ? '7px' : '9px'}; color: #FFC107; text-transform: uppercase;">QUANT ORACLE</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: ${isMobile ? '4px' : '8px'};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: Montserrat; font-weight: 700; font-size: ${fontSizeLabel}; color: #A855F7;">POSIÇÃO</span>
              <span style="font-family: JetBrains Mono; font-weight: 500; font-size: ${fontSizeValue};">$${baseAtivo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: Montserrat; font-weight: 700; font-size: ${fontSizeLabel}; color: #06B6D4;">YIELD</span>
              <span style="font-family: JetBrains Mono; font-weight: 500; font-size: ${fontSizeValue};">+$ ${yieldIncentivo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: Montserrat; font-weight: 700; font-size: ${fontSizeLabel}; color: #F97316;">HOLDERS</span>
              <span style="font-family: JetBrains Mono; font-weight: 500; font-size: ${fontSizeValue};">${holdersCount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: Montserrat; font-weight: 700; font-size: ${fontSizeLabel}; color: #22C55E;">PREÇO</span>
              <span style="font-family: JetBrains Mono; font-weight: 500; font-size: ${fontSizeValue};">$${realPrice.toFixed(5)}</span>
            </div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: ${isMobile ? '6px' : '10px'}; margin-top: ${isMobile ? '8px' : '12px'}; text-align: center;">
            <div style="font-family: Montserrat; font-weight: 700; font-size: ${isMobile ? '8px' : '9px'}; color: #777; margin-bottom: 2px;">TOTAL:</div>
            <div style="font-family: Montserrat; font-weight: 500; font-size: ${fontSizeTotal}; color: #FFC107;">$ ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        `;
      }
      const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
      const containerWidth = chart.canvas.parentNode.offsetWidth;
      const tooltipWidth = tooltipEl.offsetWidth;
      const tooltipHeight = tooltipEl.offsetHeight;
      let targetX = positionX + tooltip.caretX;
      let targetY = positionY + tooltip.caretY;
      const hMargin = 15;
      if (targetX - tooltipWidth / 2 < hMargin) { targetX = tooltipWidth / 2 + hMargin; }
      else if (targetX + tooltipWidth / 2 > containerWidth - hMargin) { targetX = containerWidth - tooltipWidth / 2 - hMargin; }
      const vMargin = 15;
      let translateY = '-110%';
      if (targetY - tooltipHeight - vMargin < 0) { translateY = '15%'; }
      tooltipEl.style.opacity = 1;
      tooltipEl.style.left = targetX + 'px';
      tooltipEl.style.top = targetY + 'px';
      tooltipEl.style.transform = `translate(-50%, ${translateY})`;
    };

    chartInstance.current = new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'PATRIMÔNIO TOTAL', data: totalPortfolioData, backgroundColor: 'rgba(255, 193, 7, 0.05)', borderColor: 'rgba(255, 193, 7, 0.1)', fill: true, pointRadius: 0, borderWidth: 1, order: 10, yAxisID: 'y' },
          { label: 'BASE DO ATIVO', data: baseAtivoData, borderColor: '#A855F7', borderWidth: 4, tension: 0.4, cubicInterpolationMode: 'monotone', pointRadius: 0, hoverRadius: 8, pointBackgroundColor: '#A855F7', order: 1, yAxisID: 'y' },
          { label: 'YIELD ALPHA', data: yieldData, borderColor: '#06B6D4', borderWidth: 4, tension: 0.4, cubicInterpolationMode: 'monotone', pointRadius: 0, hoverRadius: 8, pointBackgroundColor: '#06B6D4', order: 2, yAxisID: 'y' },
          { label: 'HOLDERS TOTAIS', data: holdersGrowthData, borderColor: '#F97316', borderWidth: 2, borderDash: [6, 4], tension: 0.4, cubicInterpolationMode: 'monotone', pointRadius: 0, hoverRadius: 6, pointBackgroundColor: '#F97316', order: 3, yAxisID: 'y2' },
          { label: 'PREÇO PROJETADO', data: precoData, borderColor: '#22C55E', borderWidth: 2, borderDash: [4, 4], tension: 0.4, cubicInterpolationMode: 'monotone', pointRadius: 0, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        clip: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { enabled: false, external: externalTooltipHandler } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#666', font: { size: isMobile ? 8 : 12, weight: 'normal' } } },
          y: { position: 'left', grid: { color: 'rgba(255, 255, 255, 0.06)' }, beginAtZero: true, ticks: { color: '#FFF', font: { size: isMobile ? 8 : 14, weight: '500' }, callback: (v: any) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K` } },
          y1: { position: 'right', display: true, grid: { drawOnChartArea: false }, ticks: { color: '#22C55E', font: { size: isMobile ? 8 : 11, weight: 'normal' }, callback: (v: any) => `$${v.toFixed(4)}` } },
          y2: { position: 'right', display: false, grid: { drawOnChartArea: false } }
        }
      }
    });
  }, [aporte, holders, ticket, supply, marketCap, isActive, bdcPrice]);

  return (
    <div className="min-h-screen p-6 md:p-14 bg-black flex flex-col items-center overflow-x-hidden">
      <header className="mb-14 text-center">
        <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter italic text-white uppercase mb-2">
          BODE SNIPER SIMULATOR
        </h1>
        <p className="text-[10px] md:text-[11px] text-gray-500 font-black uppercase tracking-[0.6em]">
          SIMULADOR DE RIQUEZA, TOKENOMICS E COMPARAÇÃO ESTRATÉGICA
        </p>
      </header>

      <div className="w-full max-w-[1400px] flex flex-col gap-14">
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          {/* ASIDE REORDENADO NO MOBILE */}
          <aside className="w-full lg:w-80 flex flex-col gap-8 lg:gap-0">
            {/* VÍDEO: Segundo elemento a aparecer no mobile */}
            <div className="order-1 lg:order-2 lg:mt-8 bg-[#111] rounded-[24px] border border-white/5 overflow-hidden shadow-2xl aspect-video relative group">
              <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                <source src="/grok-video-1f6c1d12-0d59-4dc3-a7ec-a9cf0ea8b5b7 (1).mp4" type="video/mp4" />
              </video>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">Quant AI System Live</span>
              </div>
            </div>

            {/* PARÂMETROS: Terceiro elemento no mobile */}
            <div className="order-2 lg:order-1 bg-[#111] p-8 rounded-[24px] border border-white/5 shadow-2xl">
              <h2 className="text-gold font-heading font-black uppercase text-[12px] tracking-[0.2em] border-b border-white/5 pb-5 mb-8">
                Parâmetros do sniper
              </h2>
              <div className="space-y-6">
                {[
                  { label: 'Aporte sniper (USD)', val: aporte, set: setAporte, unit: '$', readOnly: false },
                  { label: 'Novos Holders / mês', val: holders, set: setHolders, unit: 'Qtd', readOnly: false },
                  { label: 'Ticket Médio (USD)', val: ticket, set: setTicket, unit: '$', readOnly: false },
                  { label: 'Market Cap Atual (USD)', val: marketCap, set: null, unit: '$', readOnly: true, info: 'Live Oracle (10s)' },
                  { label: 'Supply Circulante', val: supply, set: null, unit: 'Tokens', readOnly: true, info: 'Pool Dynamics' },
                ].map((input, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider flex justify-between">
                      {input.label}
                      {input.info && <span className="text-[7px] text-white/20">{input.info}</span>}
                    </label>
                    <input
                      type="number"
                      value={input.val}
                      onChange={(e) => input.set && input.set(Number(e.target.value))}
                      readOnly={input.readOnly}
                      className={`bg-black border ${input.readOnly ? 'border-white/5 text-white/30 cursor-not-allowed' : 'border-white/10 text-white'} p-3 rounded-xl w-full font-mono text-[13px] focus:outline-none transition-all`}
                    />
                    <div className="flex justify-start px-1">
                      <span className="text-[9px] text-white/50 font-mono font-medium uppercase tracking-tight">
                        {input.unit} {input.val.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                  <label className="text-[10px] text-gold uppercase font-black tracking-wider">Qtd. BDC (Snipado)</label>
                  <input readOnly value={(bdcPrice > 0 ? aporte / bdcPrice : 0).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} className="bg-gold/10 border border-gold/50 p-3 rounded-xl w-full text-gold font-mono text-[13px] cursor-default" />
                  <div className="flex justify-start px-1">
                    <span className="text-[8px] text-gold/60 font-mono font-medium uppercase tracking-widest animate-pulse-gold">PREÇO LIVE: ${bdcPrice.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÃO: Quarto elemento no mobile */}
            <button className="order-3 lg:mt-auto lg:pt-8 bg-gold text-black w-full py-5 rounded-2xl font-heading font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,193,7,0.3)]">
              EXECUTAR SNIPING
            </button>
          </aside>

          <main className="flex-1 flex flex-col gap-10">
            <div className="flex justify-between items-center">
              <button onClick={fetchPrices} className="bg-gold text-black px-6 py-2.5 rounded-2xl font-heading font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-transform">
                <RefreshCw size={14} /> ATUALIZAR ORACLE
              </button>
              <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-black tracking-widest">
                <Info size={12} />
                <span>Sync automático a cada 10s</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'bdc', name: 'BDC', price: bdcPrice, icon: '/FAVICON.png', theme: 'emerald' },
                { id: 'btc', name: 'BTC', price: prices.bitcoin, icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', theme: 'gold' },
                { id: 'eth', name: 'ETH', price: prices.ethereum, icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', theme: 'orange' },
                { id: 'sol', name: 'SOL', price: prices.solana, icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', theme: 'cyan' },
              ].map(coin => (
                <div key={coin.id} className="bg-[#111] p-6 rounded-[28px] border border-white/5 flex flex-col gap-6 relative transition-all hover:border-white/10 hover:-translate-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={coin.icon} alt={coin.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-base font-heading font-black uppercase text-white tracking-tight">{coin.name}</span>
                    </div>
                    <div className={`bg-gradient-to-r ${coin.theme === 'orange' ? 'from-orange-500' : coin.theme === 'emerald' ? 'from-emerald-500' : coin.theme === 'cyan' ? 'from-cyan-500' : 'from-[#facc15]'} to-white px-5 py-2.5 rounded-xl shadow-lg`}>
                      <span className="text-black text-[14px] font-mono font-medium">
                        $ {coin.price.toLocaleString('pt-BR', { minimumFractionDigits: coin.id === 'bdc' ? 6 : 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">QTD. TOKENS</div>
                      <div className="text-[18px] font-heading font-medium text-white leading-none tracking-tighter">
                        {(aporte / coin.price).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">VALOR EM DÓLAR</div>
                      <div className="text-[18px] font-heading font-medium text-white leading-none flex items-baseline gap-2">
                        <span className="text-sm">$</span>
                        <span>{aporte.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Capital Alocado', val: `$ ${aporte.toLocaleString()}`, styles: "bg-gold/10 border-gold/50 text-gold shadow-[0_10px_40px_rgba(255,193,7,0.1)]" },
                { label: 'Patrimônio Projetado', val: `$ ${patrimonioProjetadoTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, styles: "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" },
                { label: 'Ganho Líquido (Real)', val: `$ ${ganhoLiquido.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, styles: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" },
                { label: 'Multiplicador Sniper', val: `${roiMultiplierValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}x`, styles: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-[28px] border flex flex-col gap-2 transition-all hover:scale-105 ${stat.styles}`}>
                  <span className={`text-[10px] font-black uppercase tracking-wider opacity-70`}>{stat.label}</span>
                  <span className={`text-[21px] font-heading font-medium`}>{stat.val}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-10 text-[11px] font-black uppercase tracking-[0.2em]">
              {[
                { label: 'BRONZE ESTRATÉGIA', val: bronzeValStr, pct: bronzePct },
                { label: 'PRATA PERFORMANCE', val: prataValStr, pct: prataPct },
                { label: 'OURO AUTORIDADE', val: ouroValStr, pct: ouroPct }
              ].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{h.label}</span>
                    <span className="text-white font-medium">{h.val}</span>
                  </div>
                  <div className="h-1.5 bg-black rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gold transition-all duration-1000 shadow-[0_0_15px_rgba(255,193,7,0.6)]" style={{ width: `${h.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-[24px] bg-[#080808] shadow-2xl">
              <table className="w-full text-[10px] text-left">
                <thead className="bg-[#111] text-white font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="p-6">Cripto</th>
                    <th className="p-6">Aporte USD</th>
                    <th className="p-6">Qtd. Cripto</th>
                    <th className="p-6 text-center">Valorização (12/24/36m)</th>
                    <th className="p-6 text-center">Estimativa Futuro</th>
                    <th className="p-6">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {[
                    { name: 'BDC', color: '#10b981', price: bdcPrice, icon: '/FAVICON.png' },
                    { name: 'SOL', color: '#14F195', price: prices.solana, icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
                    { name: 'ETH', color: '#F97316', price: prices.ethereum, icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
                    { name: 'BTC', color: '#FFC107', price: prices.bitcoin, icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
                  ].map(row => {
                    const stats = calculateRowStats(row.name);
                    const isBDC = row.name === 'BDC';
                    const textClass = row.name === 'ETH' ? 'text-orange-500' : (isBDC ? 'text-emerald-400 font-medium' : (row.name === 'BTC' ? 'text-gold' : (row.name === 'SOL' ? 'text-cyan-400' : 'text-white')));
                    return (
                      <tr key={row.name} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6 flex items-center gap-3">
                          <img src={row.icon} alt={row.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className={`font-black ${textClass}`}>{row.name}</span>
                        </td>
                        <td className={`p-6 font-mono ${textClass}`}>$ {aporte.toLocaleString()}</td>
                        <td className={`p-6 font-mono ${textClass}`}>{(aporte / row.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                        <td className={`p-6 text-center font-medium uppercase tracking-widest text-[10px] ${textClass}`}>{stats.vStr}</td>
                        <td className={`p-6 text-center font-medium uppercase tracking-widest text-[10px] ${textClass}`}>{stats.eStr}</td>
                        <td className={`p-6 font-mono font-medium text-xs ${textClass}`}>{stats.roi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </main>
        </div>

        <section className="relative mt-8 group">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter italic uppercase text-white">HORIZONTE EXPONENCIAL DE RIQUEZA</h2>
            <p className="text-[12px] text-gray-600 font-black uppercase tracking-[0.6em] mt-2">MODELAGEM MATEMÁTICA DE PERFORMANCE</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10 text-[12px] md:text-[14px] font-black uppercase tracking-widest text-white">
            <div className="flex items-center gap-3"><div className="w-10 md:w-12 h-2.5 bg-[#A855F7] rounded-full shadow-[0_0_10px_#A855F7]"></div> <span>Posição Alpha</span></div>
            <div className="flex items-center gap-3"><div className="w-10 md:w-12 h-2.5 bg-[#06B6D4] rounded-full shadow-[0_0_10px_#06B6D4]"></div> <span>Yield Alpha</span></div>
            <div className="flex items-center gap-3"><div className="w-10 md:w-12 h-2.5 bg-[#F97316] rounded-full border border-dashed border-white/20"></div> <span>Network Growth</span></div>
            <div className="flex items-center gap-3"><div className="w-10 md:w-12 h-1.5 border-t-2 border-dashed border-[#22C55E]"></div> <span>Preço Projetado</span></div>
          </div>
          <div className="bg-[#050505] p-6 md:p-16 h-[400px] md:h-[650px] relative shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-[40px] border border-white/5 overflow-hidden">
            <canvas ref={chartRef}></canvas>
          </div>
        </section>
      </div>

      <footer className="mt-28 mb-10 text-[11px] text-gray-900 font-black uppercase tracking-[1.2em] opacity-30 text-center flex flex-col gap-2">
        <span>Bode Sniper Quant System v8.0.0 - Oracle Live Logic</span>
        <span className="tracking-[0.6em] text-[9px]">Apenas para fins de simulação e modelagem matemática.</span>
      </footer>
    </div>
  );
};

export default App;
