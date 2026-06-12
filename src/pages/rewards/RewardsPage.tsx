import { Gift, CreditCard, Bitcoin, Wallet } from 'lucide-react';

interface RewardCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  empty: string;
}

const CATEGORIES: RewardCategory[] = [
  {
    id: 'giftcards',
    name: 'Gift Cards',
    icon: <Gift size={20} className="text-blue-400" />,
    description: 'Redeem for popular gift cards from top retailers worldwide.',
    color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    empty: 'Gift card rewards will appear here once providers are connected.',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Wallet size={20} className="text-cyan-400" />,
    description: 'Send earnings directly to your PayPal account.',
    color: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
    empty: 'PayPal cash-out options will appear here once the payment system is configured.',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: <Bitcoin size={20} className="text-orange-400" />,
    description: 'Convert points to Bitcoin, Ethereum, and other cryptocurrencies.',
    color: 'from-orange-500/10 to-orange-600/5 border-orange-500/20',
    empty: 'Crypto payout options will appear here once the crypto gateway is integrated.',
  },
];

function EmptyRewardSection({ category }: { category: RewardCategory }) {
  return (
    <div className="mb-8">
      <div className={`card p-5 mb-4 bg-gradient-to-br ${category.color}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1e2235] rounded-xl flex items-center justify-center">
            {category.icon}
          </div>
          <div>
            <h2 className="text-white font-semibold">{category.name}</h2>
            <p className="text-gray-400 text-sm">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="card p-8 text-center">
        <div className="w-12 h-12 bg-[#1e2235] rounded-xl flex items-center justify-center mx-auto mb-3">
          <CreditCard size={20} className="text-gray-500" />
        </div>
        <p className="text-gray-400 font-medium">No rewards available yet</p>
        <p className="text-gray-600 text-sm mt-1 max-w-xs mx-auto">{category.empty}</p>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Rewards</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Redeem your earned points for real rewards.
        </p>
      </div>

      {CATEGORIES.map((category) => (
        <EmptyRewardSection key={category.id} category={category} />
      ))}
    </div>
  );
}
