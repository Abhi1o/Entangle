"use client";

interface NetworkSelectorProps {
  onNetworkSelect: (network: string) => void;
}

const networks = [
  { id: "EVM", name: "Ethereum", description: "EVM Compatible Networks", color: "bg-blue-500" },
  { id: "SOLANA", name: "Solana", description: "High-speed blockchain", color: "bg-purple-500" },
  { id: "COSMOS", name: "Cosmos", description: "Internet of blockchains", color: "bg-indigo-500" },
];

export default function NetworkSelector({ onNetworkSelect }: NetworkSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Choose Your Blockchain Network
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {networks.map((network) => (
          <div
            key={network.id}
            onClick={() => onNetworkSelect(network.id)}
            className="border-2 border-gray-200 hover:border-blue-500 
                     rounded-lg p-6 cursor-pointer transition-colors 
                     duration-200 hover:shadow-lg"
          >
            <div className={`w-12 h-12 ${network.color} rounded-full mb-4 mx-auto`}></div>
            <h3 className="text-xl font-semibold text-center mb-2">{network.name}</h3>
            <p className="text-gray-600 text-center text-sm">{network.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
