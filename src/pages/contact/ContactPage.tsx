import { useState } from 'react';
import { Mail, MessageSquare, HelpCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ContactPage() {
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
      setError('Failed to send message. Please try again.');
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
            <Mail size={22} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Contact Us</h1>
          <p className="text-gray-400 mt-2">We're here to help. Send us a message.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <Mail size={18} className="text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Email Support</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Send us a message using the form. We respond to all inquiries within 24-48 hours.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
                  <MessageSquare size={18} className="text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Response Time</h3>
              </div>
              <p className="text-gray-400 text-sm">
                General inquiries: 24-48 hours<br />
                Account issues: 2-3 business days<br />
                Withdrawal inquiries: 1-5 business days
              </p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                  <HelpCircle size={18} className="text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">Before You Write</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Many questions are answered in our FAQ. Check the Support Center for quick solutions.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-5">Send a Message</h2>

              {success && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
                  <CheckCircle2 size={16} />
                  Message sent! We'll get back to you at {form.email} within 24-48 hours.
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select a topic...</option>
                    <option value="Account Issue">Account Issue</option>
                    <option value="Withdrawal Inquiry">Withdrawal Inquiry</option>
                    <option value="Survey/Offer Problem">Survey/Offer Problem</option>
                    <option value="Fraud Report">Fraud Report</option>
                    <option value="Technical Problem">Technical Problem</option>
                    <option value="Referral Inquiry">Referral Inquiry</option>
                    <option value="General Question">General Question</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    className="input-field resize-none"
                    rows={6}
                    placeholder="Please describe your issue or question in detail. Include your username and any relevant transaction IDs."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
