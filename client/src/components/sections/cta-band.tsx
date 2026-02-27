import { getSiteContent } from "@/content/site";
import { type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { Link } from "wouter";

interface CTABandProps {
  language: Language;
}

export function CTABand({ language }: CTABandProps) {
  const content = getSiteContent(language);

  return (
    <section className="py-16 bg-primary text-primary-foreground" id="cta-band">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-band-title">
          {content.ctaBand.title}
        </h2>
        <p className="text-lg opacity-90 mb-8" data-testid="text-cta-band-subtitle">
          {content.ctaBand.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button 
              size="lg" 
              variant="secondary"
              className="gap-2"
              data-testid="button-cta-contact"
            >
              <Mail className="h-5 w-5" />
              {content.ctaBand.ctaPrimary}
            </Button>
          </Link>
          <Link href="/about">
            <Button 
              size="lg" 
              variant="ghost"
              className="gap-2 bg-transparent border border-white/40 text-white hover:bg-white/10 hover:text-white"
              data-testid="button-cta-learn-more"
            >
              {content.ctaBand.ctaSecondary}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
