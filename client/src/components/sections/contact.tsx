import { useTranslation, type Language } from "@/lib/i18n";
import { Phone, Mail } from "lucide-react";

interface ContactProps {
  language: Language;
}

export function Contact({ language }: ContactProps) {
  const t = useTranslation(language);

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-contact-title">
            {t.contact.title}
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-contact-subtitle">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div data-testid="card-singapore-office">
              <h4 className="text-xl font-bold felicity-primary mb-4">{t.contact.singapore}</h4>
              <div className="space-y-3">
                <p className="text-muted-foreground" data-testid="text-singapore-office-address">
                  6 Temasek Boulevard #29-04<br />
                  Suntec Tower Four<br />
                  Singapore 038986
                </p>
                <div className="flex items-center">
                  <Phone className="felicity-primary mr-3 h-4 w-4" />
                  <span data-testid="text-singapore-office-phone">+65-6890-0730</span>
                </div>
                <div className="flex items-center">
                  <Mail className="felicity-primary mr-3 h-4 w-4" />
                  <span data-testid="text-singapore-office-email">info@fgcsg.com</span>
                </div>
              </div>
            </div>

            <div data-testid="card-tokyo-office">
              <h4 className="text-xl font-bold felicity-primary mb-4">{t.contact.tokyo}</h4>
              <div className="space-y-3">
                <p className="text-muted-foreground" data-testid="text-tokyo-office-address">
                  6th Floor, Nagatacho Glassgate<br />
                  2-16-9 Hirakawacho, Chiyoda-ku<br />
                  Tokyo, Japan
                </p>
                <div className="flex items-center">
                  <Phone className="felicity-primary mr-3 h-4 w-4" />
                  <span data-testid="text-tokyo-office-phone">+81-3-5357-1025</span>
                </div>
                
              </div>
            </div>

          </div>

          {/* Business Hours - Centered */}
          <div className="flex justify-center mt-8">
            <div className="bg-secondary rounded-lg p-6 max-w-md w-full text-center" data-testid="card-business-hours">
              <h5 className="font-semibold felicity-primary mb-2">{t.contact.businessHours}</h5>
              <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-business-hours">
                {t.contact.businessHoursTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
