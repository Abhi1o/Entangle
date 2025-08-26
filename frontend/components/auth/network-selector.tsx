'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Network {
  id: 'EVM' | 'SOLANA' | 'COSMOS';
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

const networks: Network[] = [
  {
    id: 'EVM',
    name: 'Ethereum',
    description: 'EVM Compatible Networks',
    icon: '⟠',
    color: 'bg-blue-500',
    features: ['Smart Contracts', 'DeFi', 'NFTs']
  },
  {
    id: 'SOLANA',
    name: 'Solana',
    description: 'High-speed blockchain',
    icon: '◉',
    color: 'bg-purple-500',
    features: ['Fast Transactions', 'Low Fees', 'Web3']
  },
  {
    id: 'COSMOS',
    name: 'Cosmos',
    description: 'Internet of blockchains',
    icon: '⚛',
    color: 'bg-indigo-500',
    features: ['Interoperability', 'Staking', 'Governance']
  }
];

interface NetworkSelectorProps {
  onNetworkSelect: (networkId: string) => void;
  isLoading?: boolean;
}

export function NetworkSelector({ onNetworkSelect, isLoading }: NetworkSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Choose Your Network</h2>
        <p className="text-muted-foreground mt-2">
          Select the blockchain network for your wallet
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {networks.map((network) => (
          <Card 
            key={network.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => !isLoading && onNetworkSelect(network.id)}
          >
            <CardHeader className="text-center">
              <div className={`w-16 h-16 ${network.color} rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl`}>
                {network.icon}
              </div>
              <CardTitle>{network.name}</CardTitle>
              <CardDescription>{network.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                {network.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              <Button 
                className="w-full mt-4" 
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onNetworkSelect(network.id);
                }}
              >
                {isLoading ? 'Connecting...' : `Choose ${network.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
