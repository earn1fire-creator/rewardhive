import { useState } from 'react';
import { HelpCircle, MessageCircle, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const FAQ = [
  {
    q: 'How do I start earning points?',
    a: 'Once survey and offer providers are connected by the platform admin, you can complete surveys and offers from the Surveys and Offerwalls pages to earn points.',
  },
  {
    q: 'Why are no surveys showing?',
    a: 'Survey providers require API integration by the platform administrator. Once connected, surveys will appear automatically based on your profile.',
  },
  {
    q: 'When will my withdrawal be processed?',
    a: 'Withdrawal requests are processed manually by the admin team within 1-5 business days. You\'ll receive an email notification when the status changes.',
  },
  {
    q: 'Can I use a VPN or proxy?',
    a: 'No. VPN and proxy usage is strictly prohibited on RewardHive. Detected usage will result in your earnings being flagged and your account potentially suspended.',
  },
  {
    q: 'My account was flagged — what do I do?',
    a: 'Contact support through this page with your username and a detailed explanation. Our team will review your account within 2-3 business days.',
  },
  {
    q: 'How does the referral program work?',
    a: 'Share your unique referral link from the Referrals page. Referral rewards are configured by the platform administrator and will be applied when your referrals qualify.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#2a2e45] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 py-4 px-5 text-left hover:bg-white/2 transition-colors"
      >
        <span className="text-sm font-medium text-white">{q}</span>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <p className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.username ?? '',
    email: user?.email ?? '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.name.trim()) return setError('Name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (!form.subject.trim()) return setError('Subject is required.');
    if (!form.message.trim()) return setError('Message is required.');
    if (form.message.trim().length < 20) return setError('Please provide more detail (at least 20 characters).');

    setLoading(true);
    const { error: dbErr } = await supabase.from('support_tickets').insert({
      user_id: user?.id ?? null,
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setLoading(false);

    if (dbErr) {
      setError('Failed to submit ticket. Please try again.');
    } else {
      setSuccess(true);
      setForm((f) => ({ ...f, subject: '', message: '' }));
    }
  };

  return (
    <div className="pt-14">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/15 border border-blue-500/20 rounded-2xl mb-4">
            <HelpCircle size={22} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Support Center</h1>
          <p className="text-gray-400 mt-2">Find answers or contact our team for help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* FAQ */}
          <div className="lg:col-span-3">
            <div className="card mb-6">
              <div className="flex items-center gap-2 p-5 border-b border-[#2a2e45]">
                <MessageCircle size={18} className="text-blue-400" />
                <h2 className="font-semibold text-white">Frequently Asked Questions</h2>
              </div>
              {FAQ.map((faq) => (
                <FaqItem key={faq.q} {...faq} />
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">Contact Support</h2>
              <p className="text-sm text-gray-400 mb-5">
                Can't find what you're looking for? Our team will respond within 24-48 hours.
              </p>

              {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-4">
                  <CheckCircle2 size={16} />
                  Ticket submitted. We'll respond shortly.
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="input-field text-sm"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    className="input-field text-sm resize-none"
                    rows={5}
                    placeholder="Describe your issue in detail..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
