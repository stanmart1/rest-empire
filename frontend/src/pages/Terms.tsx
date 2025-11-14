import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
              <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <div className="prose prose-sm max-w-none space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing and using Opened Seal and Rest Empire platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
                  <p className="text-muted-foreground mb-4">
                    To use our services, you must:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Be at least 18 years of age</li>
                    <li>Have the legal capacity to enter into binding contracts</li>
                    <li>Not be prohibited from using our services under applicable laws</li>
                    <li>Provide accurate and complete registration information</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                  <p className="text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Network Marketing Structure</h2>
                  <p className="text-muted-foreground mb-4">
                    Our platform operates as a multi-level marketing (MLM) system. By participating, you acknowledge that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Earnings are based on your efforts and team performance</li>
                    <li>There are no guaranteed income or returns</li>
                    <li>Success requires active participation and team building</li>
                    <li>You must comply with all applicable MLM regulations in your jurisdiction</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Activation and Fees</h2>
                  <p className="text-muted-foreground">
                    Certain features require activation through purchase of activation packages. All fees are non-refundable unless otherwise stated. You are responsible for any applicable taxes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Bonuses and Commissions</h2>
                  <p className="text-muted-foreground mb-4">
                    Bonuses and commissions are calculated according to our compensation plan:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Unilevel bonuses are paid on qualifying purchases</li>
                    <li>Rank bonuses are awarded upon achieving rank requirements</li>
                    <li>Infinity bonuses are distributed monthly to qualifying ranks</li>
                    <li>All bonuses are subject to verification and compliance checks</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Payouts</h2>
                  <p className="text-muted-foreground">
                    Payout requests are subject to minimum thresholds and processing fees. We reserve the right to delay or deny payouts if we suspect fraudulent activity or policy violations.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Prohibited Activities</h2>
                  <p className="text-muted-foreground mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Use the platform for any illegal purposes</li>
                    <li>Create multiple accounts or fake accounts</li>
                    <li>Manipulate the referral or bonus system</li>
                    <li>Engage in fraudulent transactions</li>
                    <li>Harass or spam other users</li>
                    <li>Reverse engineer or attempt to access unauthorized areas</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to suspend or terminate your account at any time for violations of these terms, fraudulent activity, or at our discretion. Upon termination, your right to use the services will immediately cease.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    To the maximum extent permitted by law, Opened Seal and Rest Empire shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                  <p className="text-muted-foreground">
                    For questions about these Terms of Service, please contact us through our support page or email us at legal@restempire.com
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
