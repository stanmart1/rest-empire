import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Privacy = () => {
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
              <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <div className="prose prose-sm max-w-none space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground mb-4">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Personal identification information (name, email address, phone number)</li>
                    <li>Account credentials and authentication information</li>
                    <li>Profile information including profile pictures</li>
                    <li>Financial information for transactions and payouts</li>
                    <li>Communication data when you contact our support team</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send administrative information and updates</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                    <li>Detect and prevent fraudulent transactions</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                  <p className="text-muted-foreground">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                    <li>With your consent or at your direction</li>
                    <li>With service providers who assist in our operations</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and prevent fraud</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                  <p className="text-muted-foreground mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Access and receive a copy of your personal data</li>
                    <li>Correct inaccurate or incomplete data</li>
                    <li>Request deletion of your personal data</li>
                    <li>Object to or restrict processing of your data</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                  <p className="text-muted-foreground">
                    We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us through our support page or email us at privacy@restempire.com
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

export default Privacy;
