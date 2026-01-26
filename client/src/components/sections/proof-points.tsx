import { getSiteContent } from "@/content/site";
import { type Language } from "@/lib/i18n";
import { Globe, Shield, Handshake } from "lucide-react";

interface ProofPointsProps {
  language: Language;
}

const iconMap: Record<string, any> = {
  Globe,
  Shield,
  Handshake
};

export function ProofPoints({ language }: ProofPointsProps) {
  const content = getSiteContent(language);

  return (
    <section className="bg-primary/5 border-y border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.proofPoints.map((point, index) => {
            const IconComponent = iconMap[point.icon] || Globe;
            return (
              <div 
                key={index} 
                className="flex items-center gap-4 justify-center md:justify-start"
                data-testid={`proof-point-${index}`}
              >
                <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
