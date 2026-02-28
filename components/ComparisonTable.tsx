
import React from 'react';

const TABLE_DATA = [
  { symbol: 'BDC', name: 'BodeCoin', color: '#10b981', aporte: 1000, qtd: 76394.3245, roi: '540.67%', icon: '🐐' },
  { symbol: 'SOL', name: 'Solana', color: '#14F195', aporte: 1000, qtd: 7.8423, roi: '540.67%', icon: '◎' },
  { symbol: 'ETH', name: 'Ethereum', color: '#F97316', aporte: 1000, qtd: 0.3428, roi: '540.67%', icon: 'Ξ' },
  { symbol: 'BTC', name: 'Bitcoin', color: '#FFC107', aporte: 1000, qtd: 0.0112, roi: '540.67%', icon: '₿' },
];

const ComparisonTable: React.FC = () => {
  return (
    <div className="overflow-x-auto w-full border border-white/5 rounded-2xl bg-[#080808] shadow-2xl mt-4">
      <table className="w-full text-left text-[10px] border-collapse">
        <thead className="bg-[#111111] text-[8px] uppercase text-gray-400 font-black tracking-widest border-b border-white/5">
          <tr>
            <th className="p-5">Cripto</th>
            <th className="p-5">Aporte USD</th>
            <th className="p-5">Qtd. Cripto</th>
            <th className="p-5 text-center" colSpan={3}>Valorização (Meses)</th>
            <th className="p-5 text-center" colSpan={3}>Estimativa Futuro</th>
            <th className="p-5">ROI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {TABLE_DATA.map((row) => {
             const isBDC = row.symbol === 'BDC';
             const isBTC = row.symbol === 'BTC';
             const isETH = row.symbol === 'ETH';
             const isSOL = row.symbol === 'SOL';
             
             const isGreen = isBDC;
             const isYellow = isBTC;
             const isOrange = isETH;
             const isCyan = isSOL;

             const rowColorClass = isOrange ? 'text-orange-500' : (isGreen ? 'text-emerald-400' : (isYellow ? 'text-gold' : (isCyan ? 'text-cyan-400' : 'text-white')));
             
             return (
               <tr key={row.symbol} className={`hover:bg-white/5 transition-colors group ${isOrange ? 'bg-orange-500/5' : (isGreen ? 'bg-emerald-500/5' : (isYellow ? 'bg-gold/5' : ''))}`}>
                 <td className="p-5 flex items-center gap-2">
                   <span className="text-base leading-none" style={{ color: row.color }}>{row.icon}</span>
                   <span className={`font-heading font-black ${rowColorClass}`}>{row.symbol}</span>
                   <span className="text-[7px] text-gray-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{row.name.toUpperCase()}</span>
                 </td>
                 <td className={`p-5 font-mono ${rowColorClass}`}>$ {row.aporte.toLocaleString()}</td>
                 <td className={`p-5 font-mono ${rowColorClass}`}>{row.qtd.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                 <td className="p-5 text-center text-[8px] text-gray-500 font-bold uppercase">{row.symbol}</td>
                 <td className="p-5 text-center text-[8px] text-gray-500 font-bold uppercase">{row.symbol}</td>
                 <td className="p-5 text-center text-[8px] text-gray-500 font-bold uppercase">{row.symbol}</td>
                 <td className={`p-5 text-center text-[8px] font-bold uppercase ${isOrange ? 'text-orange-500' : (isGreen ? 'text-emerald-400' : 'text-gold')}`}>{row.symbol}</td>
                 <td className={`p-5 text-center text-[8px] font-bold uppercase ${isOrange ? 'text-orange-500' : (isGreen ? 'text-emerald-400' : 'text-gold')}`}>{row.symbol}</td>
                 <td className={`p-5 text-center text-[8px] font-bold uppercase ${isOrange ? 'text-orange-500' : (isGreen ? 'text-emerald-400' : 'text-gold')}`}>{row.symbol}</td>
                 <td className={`p-5 font-mono font-black text-[11px] ${isOrange ? 'text-orange-500' : (isGreen ? 'text-emerald-400' : 'text-gold')}`}>{row.roi}</td>
               </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
