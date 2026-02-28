
import React from 'react';
import { SniperParams } from '../types';

interface SidebarProps {
  params: SniperParams;
  onChange: (key: keyof SniperParams, value: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ params, onChange }) => {
  return (
    <div className="w-full lg:w-80 flex flex-col gap-6 bg-card p-6 rounded-2xl border border-white/5 shadow-2xl">
      <h3 className="text-gold font-heading font-black uppercase text-xs tracking-widest border-b border-white/10 pb-4">
        Parâmetros do sniper
      </h3>
      
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Aporte sniper (USD)</label>
          <input
            type="number"
            value={params.aporte}
            onChange={(e) => onChange('aporte', Number(e.target.value))}
            className="bg-black text-white font-mono text-[13px] p-3 rounded-lg border border-white/10 focus:border-gold outline-none w-full transition-all"
          />
          <div className="flex justify-start">
            <span className="text-[9px] text-white font-mono font-bold uppercase tracking-tighter">$ {params.aporte.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Novos Holders / mês</label>
          <input
            type="number"
            value={params.novosHolders}
            onChange={(e) => onChange('novosHolders', Number(e.target.value))}
            className="bg-black text-white font-mono text-[13px] p-3 rounded-lg border border-white/10 focus:border-gold outline-none w-full transition-all"
          />
          <div className="flex justify-start">
            <span className="text-[9px] text-white font-mono font-bold uppercase tracking-tighter">Qtd. {params.novosHolders.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Ticket Médio (USD)</label>
          <input
            type="number"
            value={params.ticketMedio}
            onChange={(e) => onChange('ticketMedio', Number(e.target.value))}
            className="bg-black text-white font-mono text-[13px] p-3 rounded-lg border border-white/10 focus:border-gold outline-none w-full transition-all"
          />
          <div className="flex justify-start">
            <span className="text-[9px] text-white font-mono font-bold uppercase tracking-tighter">$ {params.ticketMedio.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 opacity-60">
          <label className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Qtd. BDC (Calculado)</label>
          <input
            type="text"
            readOnly
            value={params.qtdBDC.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
            className="bg-[#080808] text-gray-400 font-mono text-[13px] p-3 rounded-lg border border-white/5 outline-none w-full cursor-not-allowed"
          />
          <div className="flex justify-start">
            <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-widest">Calculo Automático</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
