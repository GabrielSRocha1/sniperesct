
import React from 'react';
import { Bitcoin, Flame, Wallet, Layers } from 'lucide-react';

export const ASSETS_CONFIG = [
  { symbol: 'BDC', name: 'BodeCoin', color: '#10b981', icon: <Layers size={16} /> },
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', icon: <Bitcoin size={16} /> },
  { symbol: 'ETH', name: 'Ethereum', color: '#F97316', icon: <Flame size={16} /> },
  { symbol: 'SOL', name: 'Solana', color: '#14F195', icon: <Wallet size={16} /> },
];

export const INITIAL_PARAMS = {
  aporte: 1000,
  novosHolders: 1000,
  ticketMedio: 1000,
  qtdBDC: 1000,
  taxaCompra: 0.02,
  slippage: 0.05,
};
