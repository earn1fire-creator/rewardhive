import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { useRouter } from '../../contexts/RouterContext';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const { navigate, goBack } = useRouter();

  return (
    <div className="pt-14">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: January 1, 2025</p>
        </div>

        <div className="card p-8">
          <Section title="1. Introduction">
            <p>
              RewardHive ("we", "us", or "our") is committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our platform.
            </p>
            <p>
              By using RewardHive, you agree to the collection and use of information in accordance with
              this policy. If you do not agree, please do not use our services.
            </p>
          </Section>

          <Section title="2. Data Controller">
            <p>
              RewardHive acts as the data controller for the information collected through the platform
              and is responsible for handling user information according to this Privacy Policy. As data
              controller, we determine the purposes and means of processing your personal data and are
              accountable for ensuring that data is handled lawfully, fairly, and transparently.
            </p>
          </Section>

          <Section title="3. Information We Collect">
            <p><strong className="text-white">Account Information:</strong> When you register, we collect your username, email address, and password (stored securely using industry-standard hashing).</p>
            <p><strong className="text-white">Profile Information:</strong> Country of residence and other optional profile details you choose to provide.</p>
            <p><strong className="text-white">Activity Data:</strong> Information about surveys completed, offers engaged with, points earned, and withdrawals requested.</p>
            <p><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, and connection data used for security and fraud prevention purposes.</p>
            <p><strong className="text-white">Communications:</strong> Support tickets and messages you send to our team.</p>
          </Section>

          <Section title="4. Cookies and Tracking">
            <p>
              We use cookies and similar tracking technologies to maintain your session, remember your preferences,
              and analyze platform usage. Cookies are small data files stored on your device.
            </p>
            <p>
              <strong className="text-white">Essential Cookies:</strong> Required for the platform to function (authentication sessions, security tokens).
            </p>
            <p>
              <strong className="text-white">Analytics Cookies:</strong> Help us understand how users interact with the platform to improve our services. You may opt out of analytics cookies without affecting platform functionality.
            </p>
            <p>
              You can control cookies through your browser settings. Disabling essential cookies will prevent you from using most features of RewardHive.
            </p>
          </Section>

          <Section title="5. Third-Party Survey and Offer Providers">
            <p>
              RewardHive works with trusted third-party survey, offer, and market research providers.
              These providers may collect and process information according to their own privacy policies
              and terms. When you interact with surveys or offers on the platform, the relevant provider
              may independently collect data about your participation.
            </p>
            <p>
              We encourage you to review the privacy policies of any third-party providers whose surveys
              or offers you engage with. RewardHive is not responsible for the data practices of these
              independent providers.
            </p>
          </Section>

          <Section title="6. How We Use Your Information">
            <p>We use collected information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, operate, and improve the RewardHive platform</li>
              <li>Process your point earnings, rewards, and withdrawal requests</li>
              <li>Detect and prevent fraud, abuse, and policy violations</li>
              <li>Respond to your support requests and inquiries</li>
              <li>Send important account and security notifications</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="7. Data Sharing">
            <p>
              We do not sell your personal data. We may share your information only:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>With survey/offer providers as necessary to validate completions and process rewards</li>
              <li>With service providers who assist in platform operations (hosting, database, email)</li>
              <li>When required by law or to protect our legal rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain your account data for as long as your account is active. Transaction records are
              retained for up to 7 years for legal and financial compliance. If you delete your account,
              personal data will be removed within 30 days, except where retention is legally required.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access a copy of your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
            </ul>
            <p>To exercise these rights, contact us through the Support page.</p>
          </Section>

          <Section title="10. Security">
            <p>
              We implement industry-standard security measures including encrypted connections (HTTPS/TLS),
              hashed passwords, row-level database security, and fraud detection systems. However, no
              system is completely secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              RewardHive is not intended for users under 18 years of age. We do not knowingly collect
              personal information from minors. If we become aware that a minor has registered, we will
              terminate the account and delete associated data.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify registered users of material
              changes via email. Continued use of the platform after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For privacy-related inquiries, data access requests, or to exercise your rights under this
              policy, please reach out through one of the following channels:
            </p>
            <div className="mt-4 rounded-lg border border-[#2a2e45] bg-[#1a1d2e] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Privacy Inquiries</p>
                  <p className="text-gray-400 text-xs mt-0.5">privacy@rewardhive.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Support Center</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Visit our{' '}
                    <button
                      onClick={() => navigate('support')}
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      Support center
                    </button>{' '}
                    or{' '}
                    <button
                      onClick={() => navigate('contact')}
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      Contact page
                    </button>{' '}
                    to submit a request.
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
