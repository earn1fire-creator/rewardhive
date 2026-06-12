import { useEffect, useState } from 'react';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';

type LeaderEntry = Pick<Profile, 'id' | 'username' | 'points_balance' | 'total_earned' | 'surveys_completed'>;

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy size={16} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={16} className="text-gray-300" />;
  if (rank === 3) return <Medal size={16} className="text-amber-600" />;
  return <span className="text-sm font-semibold text-gray-500 w-4 text-center">{rank}</span>;
};

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, points_balance, total_earned, surveys_completed')
        .order('total_earned', { ascending: false })
        .limit(50);
      setLeaders((data as LeaderEntry[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const myRank = user ? leaders.findIndex((l) => l.id === user.id) + 1 : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Top earners on the RewardHive platform.</p>
      </div>

      {/* My rank card */}
      {myRank > 0 && (
        <div className="card p-4 mb-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {myRank}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Your Ranking</p>
              <p className="text-gray-400 text-xs">Keep earning to climb higher!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">{(profile?.total_earned ?? 0).toLocaleString()} pts</p>
            <p className="text-gray-500 text-xs">total earned</p>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="card">
        <div className="p-5 border-b border-[#2a2e45] flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          <h2 className="font-semibold text-white">Top Earners</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-gray-500 animate-spin" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Trophy size={28} className="text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">No entries yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to earn points and claim the top spot!</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-2.5 text-xs font-medium text-gray-500 border-b border-[#2a2e45] bg-[#0d0f18]">
              <span className="col-span-1">Rank</span>
              <span className="col-span-5">User</span>
              <span className="col-span-3 text-right">Balance</span>
              <span className="col-span-3 text-right">Total Earned</span>
            </div>

            <div className="divide-y divide-[#2a2e45]">
              {leaders.map((leader, index) => {
                const rank = index + 1;
                const isMe = leader.id === user?.id;
                return (
                  <div
                    key={leader.id}
                    className={`grid grid-cols-12 px-5 py-3.5 items-center transition-colors ${
                      isMe ? 'bg-blue-600/5' : 'hover:bg-white/2'
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      <RankIcon rank={rank} />
                    </div>
                    <div className="col-span-5 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                        rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        rank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                        'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {leader.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">
                          {leader.username}
                          {isMe && <span className="ml-1.5 text-xs text-blue-400">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-500">{leader.surveys_completed} surveys</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="text-sm font-semibold text-white">
                        {leader.points_balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="text-sm font-semibold text-emerald-400">
                        {leader.total_earned.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
