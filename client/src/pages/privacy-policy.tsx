import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useTranslation, type Language } from "@/lib/i18n";
import { useState } from "react";

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = useTranslation(language);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20">
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-privacy-title">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-privacy-subtitle">
                Last updated: August 30, 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">1. Introduction</h2>
                  <p className="text-muted-foreground mb-4">
                    Felicity Global Capital Pte. Ltd. ("we", "our", or "us") is committed to protecting and respecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                    or use our services.
                  </p>
                  <p className="text-muted-foreground">
                    This policy complies with the Personal Data Protection Act 2012 (PDPA) of Singapore, the General Data Protection 
                    Regulation (GDPR) of the European Union, and applicable privacy laws in the United States.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">2. Information We Collect</h2>
                  <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>Name and contact information (email address, phone number, postal address)</li>
                    <li>Professional information (company name, job title, industry)</li>
                    <li>Financial information (investment preferences, portfolio details)</li>
                    <li>Identity verification documents as required by law</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mb-3">Technical Information</h3>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Website usage data and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">3. How We Use Your Information</h2>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>To provide and maintain our investment management services</li>
                    <li>To process transactions and manage your portfolio</li>
                    <li>To comply with legal and regulatory requirements</li>
                    <li>To communicate with you about our services</li>
                    <li>To improve our website and services</li>
                    <li>To detect and prevent fraud and security threats</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">4. Legal Basis for Processing (GDPR)</h2>
                  <p className="text-muted-foreground mb-4">
                    For users in the European Union, we process your personal data based on:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li><strong>Contractual necessity:</strong> To perform our services under our agreement with you</li>
                    <li><strong>Legal obligation:</strong> To comply with financial services regulations</li>
                    <li><strong>Legitimate interests:</strong> To improve our services and prevent fraud</li>
                    <li><strong>Consent:</strong> For marketing communications (where required)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">5. Information Sharing and Disclosure</h2>
                  <p className="text-muted-foreground mb-4">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>Service providers who assist in our operations</li>
                    <li>Regulatory authorities as required by law</li>
                    <li>Professional advisors (lawyers, auditors, consultants)</li>
                    <li>Law enforcement agencies when legally required</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">6. Data Security</h2>
                  <p className="text-muted-foreground mb-4">
                    We implement appropriate technical and organizational measures to protect your personal data, including:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Access controls and authentication systems</li>
                    <li>Regular security assessments and updates</li>
                    <li>Staff training on data protection</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">7. Your Rights</h2>
                  
                  <h3 className="text-xl font-semibold mb-3">Under Singapore PDPA</h3>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>Right to withdraw consent</li>
                    <li>Right to access your personal data</li>
                    <li>Right to request correction of inaccurate data</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">Under EU GDPR</h3>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>Right to access, rectify, or erase your data</li>
                    <li>Right to restrict or object to processing</li>
                    <li>Right to data portability</li>
                    <li>Right to lodge a complaint with supervisory authorities</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3">Under US Laws</h3>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to delete personal information (subject to exceptions)</li>
                    <li>Right to opt-out of sale of personal information</li>
                    <li>Right to non-discrimination for exercising privacy rights</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">8. International Data Transfers</h2>
                  <p className="text-muted-foreground mb-4">
                    We may transfer your personal data to countries outside your jurisdiction. When we do so, we ensure 
                    appropriate safeguards are in place, including:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                    <li>Adequacy decisions by relevant authorities</li>
                    <li>Standard contractual clauses</li>
                    <li>Binding corporate rules</li>
                    <li>Other legally recognized transfer mechanisms</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">9. Data Retention</h2>
                  <p className="text-muted-foreground">
                    We retain personal data for as long as necessary to fulfill the purposes outlined in this policy, 
                    comply with legal obligations, resolve disputes, and enforce our agreements. Specific retention 
                    periods may vary based on the type of data and applicable regulations.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">10. Cookies and Tracking Technologies</h2>
                  <p className="text-muted-foreground mb-4">
                    We use cookies and similar technologies to enhance your experience. You can manage cookie preferences 
                    through your browser settings. Some cookies are essential for website functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">11. Updates to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy periodically. We will notify you of material changes through 
                    our website or other appropriate means. Your continued use of our services constitutes acceptance 
                    of the updated policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold felicity-primary mb-4">12. Contact Information</h2>
                  <div className="bg-secondary rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Data Protection Officer</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Email:</strong> privacy@fgcsg.com</p>
                      <p><strong>Singapore Office:</strong><br />
                        6 Temasek Boulevard #29-04<br />
                        Suntec Tower Four<br />
                        Singapore 038986<br />
                        Phone: +65-6890-0730
                      </p>
                      <p><strong>Tokyo Office:</strong><br />
                        6th Floor, Nagatacho Glassgate<br />
                        2-16-9 Hirakawacho, Chiyoda-ku<br />
                        Tokyo, Japan<br />
                        Phone: +81-3-5357-1025
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-primary/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold felicity-primary mb-3">Regulatory Information</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li><strong>Singapore:</strong> Personal Data Protection Commission (PDPC)</li>
                    <li><strong>EU:</strong> Relevant Data Protection Authority in your jurisdiction</li>
                    <li><strong>US:</strong> State Attorney General's office or relevant privacy regulator</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}