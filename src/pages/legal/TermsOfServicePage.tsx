import { ArrowLeft } from 'lucide-react';
import { useRouter } from '../../contexts/RouterContext';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: January 1, 2025</p>
        </div>

        <div className="card p-8">
          <Section title="1. Acceptance of Terms">
            <p>
              By registering for or using RewardHive ("Platform"), you agree to be bound by these Terms of Service.
              If you do not agree, you must not use the platform. These terms apply to all users, including visitors,
              registered members, and administrators.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years old to use RewardHive. By registering, you represent that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are 18 years of age or older</li>
              <li>You are capable of forming a legally binding contract</li>
              <li>Your use of the platform complies with all applicable laws in your jurisdiction</li>
              <li>You will provide accurate registration information</li>
            </ul>
          </Section>

          <Section title="3. Account Responsibilities">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use a strong, unique password for your account</li>
              <li>Notify us immediately if you suspect unauthorized access</li>
              <li>Not share your account with others</li>
              <li>Not create multiple accounts to circumvent restrictions or earn duplicate rewards</li>
              <li>Ensure all account information remains accurate and up to date</li>
            </ul>
          </Section>

          <Section title="4. Fraud Prevention and Prohibited Activities">
            <p>
              RewardHive employs strict fraud detection. The following activities are strictly prohibited
              and will result in immediate account suspension and forfeiture of all earned points:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Fraudulent completions:</strong> Submitting surveys or offers using bots, scripts, or automated tools</li>
              <li><strong className="text-white">False information:</strong> Providing inaccurate demographic data to qualify for higher-paying surveys</li>
              <li><strong className="text-white">Chargebacks:</strong> Initiating fraudulent payment disputes</li>
              <li><strong className="text-white">Account farming:</strong> Creating multiple accounts to earn duplicate rewards</li>
              <li><strong className="text-white">Manipulation:</strong> Attempting to manipulate point balances or circumvent the reward system</li>
            </ul>
          </Section>

          <Section title="5. VPN and Proxy Restrictions">
            <p>
              The use of VPNs, proxies, Tor, or any IP masking technology is <strong className="text-white">strictly prohibited</strong> on RewardHive.
              Survey and offer providers require accurate geolocation data to serve appropriate content and validate completions.
            </p>
            <p>
              Accounts found using VPNs or proxies will be:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Immediately flagged for review</li>
              <li>Subject to point forfeiture</li>
              <li>Potentially permanently banned</li>
            </ul>
          </Section>

          <Section title="6. Reward Rules and Points System">
            <p>
              Points are virtual currency with no cash value outside the RewardHive platform. The following rules apply:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Points are credited only for legitimate, verified completions as confirmed by third-party providers</li>
              <li>Points may be withheld or reversed if completions are later found to be fraudulent</li>
              <li>RewardHive reserves the right to adjust point values and minimum thresholds at any time</li>
              <li>Points have no monetary value and cannot be transferred between accounts</li>
              <li>Expired or forfeited points cannot be recovered</li>
            </ul>
          </Section>

          <Section title="7. Withdrawal Policy">
            <p>
              Withdrawal requests are subject to the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Minimum balance requirements must be met for each withdrawal method</li>
              <li>Processing takes 1-5 business days</li>
              <li>We reserve the right to request identity verification before processing large withdrawals</li>
              <li>Withdrawals may be delayed or refused if fraud is suspected</li>
              <li>We are not responsible for delays caused by third-party payment processors</li>
            </ul>
          </Section>

          <Section title="8. Account Suspension and Termination">
            <p>
              RewardHive may suspend or terminate your account at any time for violations of these Terms.
              Grounds for suspension include but are not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fraud or attempted fraud</li>
              <li>VPN or proxy usage</li>
              <li>Providing false information</li>
              <li>Abuse of the referral system</li>
              <li>Harassment of other users or staff</li>
              <li>Any activity that damages the platform or other users</li>
            </ul>
            <p>
              Upon termination for violations, all accumulated points are forfeited. You may appeal
              suspension decisions through the support system.
            </p>
          </Section>

          <Section title="9. User Responsibilities">
            <p>You agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the platform only for lawful purposes</li>
              <li>Complete surveys and offers honestly and in good faith</li>
              <li>Not interfere with or disrupt platform operations</li>
              <li>Not attempt to reverse-engineer or exploit platform vulnerabilities</li>
              <li>Report any security vulnerabilities responsibly to our team</li>
            </ul>
          </Section>

          <Section title="10. Intellectual Property">
            <p>
              All content, branding, and software on RewardHive are the intellectual property of RewardHive
              or its licensors. You may not copy, reproduce, or distribute any platform content without
              express written permission.
            </p>
          </Section>

          <Section title="11. Disclaimer of Warranties">
            <p>
              RewardHive is provided "as is" without warranties of any kind. We do not guarantee continuous,
              uninterrupted access to the platform. Third-party survey and offer availability may vary and is
              outside our direct control.
            </p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, RewardHive shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the platform. Our
              total liability shall not exceed the value of points held in your account at the time of the claim.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. Continued use after changes constitutes
              acceptance. Material changes will be communicated via email to registered users.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For questions about these Terms, please{' '}
              <button onClick={() => navigate('contact')} className="text-blue-400 hover:text-blue-300 underline">
                contact us
              </button>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
