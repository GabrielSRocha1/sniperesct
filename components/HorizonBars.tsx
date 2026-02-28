
import React from 'react';

interface HorizonBarsProps {
  stats: { label: string; value: string; pct: number }[];
}

const HorizonBars: React.FC<HorizonBarsProps> = ({ stats }) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
      {stats.map((stat, i) => (
        <div key={i} className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500">
            <span>{stat.label}</span>
            <span className="text-white text-xs">{stat.value}</span>
          </div>
          <div className="h-4 bg-white/5 rounded-sm overflow-hidden border border-white/10 relative">
            <div 
              className="h-full bg-gradient-to-r from-yellow-700 to-yellow-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, (stat.pct / 2000) * 100)}%` }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-white">{stat.pct.toLocaleString()}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizonBars;
