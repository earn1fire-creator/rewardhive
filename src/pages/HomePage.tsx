import { Shield, Zap, BarChart3, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import Header from '../components/layout/Header';

export default function HomePage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#0d0f18]">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6 font-medium">
            <Zap size={14} />
            Professional Survey & Rewards Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Earn rewards by completing
            <span className="gradient-text block">surveys and offers</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join RewardHive and turn your opinions into real rewards. Complete surveys and offers from trusted providers to earn points redeemable for PayPal, gift cards, and crypto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('register')}
              className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2 group"
            >
              Create Free Account
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('login')}
              className="btn-secondary text-base px-8 py-3"
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500">
            {['No credit card required', 'Free to join', 'Instant access'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-[#0f1120]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">Get started in minutes and start earning real rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Register with your email. No personal info required to get started.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                step: '02',
                title: 'Complete Surveys',
                desc: 'Browse and complete surveys and offers from trusted providers.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                step: '03',
                title: 'Earn Points',
                desc: 'Each completed task earns you points credited to your wallet.',
                color: 'from-cyan-500 to-cyan-600',
              },
              {
                step: '04',
                title: 'Redeem Rewards',
                desc: 'Convert your points to PayPal cash, gift cards, or crypto.',
                color: 'from-emerald-500 to-emerald-600',
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="card p-6 relative group hover:border-blue-500/40 transition-all card-glow">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm mb-4`}>
                  {step}
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Why Choose RewardHive</h2>
            <p className="text-gray-400">Built for reliability, security, and maximum earnings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Star className="text-yellow-400" size={22} />,
                title: 'Real Survey Providers',
                desc: 'Connected to verified, top-tier survey and offer networks globally.',
              },
              {
                icon: <Shield className="text-blue-400" size={22} />,
                title: 'Secure Rewards',
                desc: 'Bank-level encryption and fraud detection protect every transaction.',
              },
              {
                icon: <Zap className="text-purple-400" size={22} />,
                title: 'Fast Withdrawals',
                desc: 'Withdraw your earnings quickly to PayPal, gift cards, or crypto.',
              },
              {
                icon: <BarChart3 className="text-emerald-400" size={22} />,
                title: 'Anti-Fraud System',
                desc: 'Advanced VPN and proxy detection keeps the platform fair for everyone.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card p-6 hover:border-blue-500/40 transition-all card-glow">
                <div className="w-10 h-10 bg-[#1e2235] rounded-xl flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">Ready to Start Earning?</h2>
              <p className="text-gray-400 mb-8">
                Create your free account today and start earning rewards from real survey providers.
              </p>
              <button
                onClick={() => navigate('register')}
                className="btn-primary text-base px-10 py-3"
              >
                Get Started — It's Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2e45] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <span className="font-bold text-white">RewardHive</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button onClick={() => navigate('privacy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => navigate('terms')} className="hover:text-white transition-colors">
                Terms of Service
              </button>
              <button onClick={() => navigate('contact')} className="hover:text-white transition-colors">
                Contact
              </button>
              <button onClick={() => navigate('support')} className="hover:text-white transition-colors">
                Support
              </button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#2a2e45] text-center text-xs text-gray-600">
            &copy; {new Date().getFullYear()} RewardHive. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
