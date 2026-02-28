
import React from 'react';
import { AssetStats } from '../types';

interface StatCardsProps {
  assets: (AssetStats & { price: number })[];
}

const StatCards: React.FC<StatCardsProps> = ({ assets }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {assets.map((asset) => (
        <div key={asset.symbol} className="bg-[#111] p-6 rounded-[28px] border border-white/5 flex flex-col gap-6 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none">{asset.icon}</span>
              <span className="text-base font-heading font-black text-white tracking-tight uppercase">{asset.symbol}</span>
            </div>
            {/* Badge: Gradiente Amarelo para Branco, texto preto maior (14px) */}
            <div className="bg-gradient-to-r from-[#facc15] to-white px-5 py-2.5 rounded-xl">
              <span className="text-black text-[14px] font-mono font-black">
                $ {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: asset.symbol === 'BDC' ? 4 : 2 })}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">QTD. TOKENS</span>
              {/* Outros números reduzidos em 30% (26px -> 18px) */}
              <span className="text-[18px] font-heading font-black text-white leading-none tracking-tighter">
                {asset.qtd.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">VALOR EM DÓLAR</span>
              {/* Outros números reduzidos em 30% (26px -> 18px) */}
              <div className="text-[18px] font-heading font-black text-white leading-none flex items-baseline gap-2">
                <span className="text-sm">$</span>
                <span>{asset.valueUsd.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
