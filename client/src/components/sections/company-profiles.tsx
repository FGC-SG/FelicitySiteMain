import { Phone } from "lucide-react";
import jewelChangiImage from "@assets/generated_images/Jewel_Changi_waterfall_architecture_a9142a7a.png";
import mountFujiImage from "@assets/generated_images/Tokyo_skyline_Mount_Fuji_backdrop_346b3530.png";
import { useTranslation, type Language } from "@/lib/i18n";

interface CompanyProfilesProps {
  language: Language;
}

export function CompanyProfiles({ language }: CompanyProfilesProps) {
  const t = useTranslation(language);

  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-profiles-title">
            {t.profiles.title}
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-profiles-subtitle">
            {t.profiles.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Singapore Entity */}
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden" data-testid="card-singapore-entity">
            <div className="relative h-48">
              {/* Singapore business district with Marina Bay Financial Centre towers */}
              <img
                src={jewelChangiImage}
                alt="Jewel Changi Airport waterfall"
                className="w-full h-full object-cover"
                data-testid="img-singapore-skyline"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-2xl font-bold text-white">Singapore</h3>
              </div>
            </div>
            <div className="p-8">
              <h4 className="text-xl font-bold felicity-primary mb-4" data-testid="text-singapore-company-name">
                {t.profiles.singapore.title}
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{t.profiles.singapore.chairman}</span>
                  <span className="text-muted-foreground" data-testid="text-singapore-chairman">Tomohiro Fujita</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t.profiles.singapore.capital}</span>
                  <span className="text-muted-foreground" data-testid="text-singapore-capital">SGD 13,716,823</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t.profiles.singapore.business}</span>
                  <span className="text-muted-foreground" data-testid="text-singapore-business">Fund Management</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4" data-testid="text-singapore-address">
                  6 Temasek Boulevard #29-04 Suntec Tower Four, Singapore 038986
                </p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="felicity-primary mr-2 h-4 w-4" />
                    <span data-testid="text-singapore-phone-main">+65-6890-0730 (Singapore)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="felicity-primary mr-2 h-4 w-4" />
                    <span data-testid="text-singapore-phone-japan">+81-3-5357-1026 (Japan)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Japan Entity */}
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden" data-testid="card-japan-entity">
            <div className="relative h-48">
              {/* Modern Tokyo business district skyline */}
              <img
                src={mountFujiImage}
                alt="Tokyo business district with Mount Fuji"
                className="w-full h-full object-cover"
                data-testid="img-tokyo-skyline"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-2xl font-bold text-white">Tokyo</h3>
              </div>
            </div>
            <div className="p-8">
              <h4 className="text-xl font-bold felicity-primary mb-4" data-testid="text-japan-company-name">
                {t.profiles.japan.title}
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{t.profiles.japan.ceo}</span>
                  <span className="text-muted-foreground" data-testid="text-japan-ceo">Tomohiro Fujita</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t.profiles.japan.capital}</span>
                  <span className="text-muted-foreground" data-testid="text-japan-capital">JPY 10 million</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t.profiles.japan.business}</span>
                  <span className="text-muted-foreground" data-testid="text-japan-business">Fund Management</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4" data-testid="text-japan-address">
                  6th Floor, Nagatacho Glassgate, 2-16-9 Hirakawacho, Chiyoda-ku, Tokyo
                </p>
                <div className="flex items-center text-sm">
                  <Phone className="felicity-primary mr-2 h-4 w-4" />
                  <span data-testid="text-japan-phone">+81-3-5357-1025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
