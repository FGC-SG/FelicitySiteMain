import { getSiteContent } from "@/content/site";
import { type Language } from "@/lib/i18n";
import { FileCheck, Lock, Eye, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TrustModuleProps {
  language: Language;
}

const iconMap: Record<string, any> = {
  FileCheck,
  Lock,
  Eye,
  ShieldCheck
};

export function TrustModule({ language }: TrustModuleProps) {
  const content = getSiteContent(language);

  return (
    <section className="py-20 bg-background" id="trust">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-trust-title">
            {content.trustModule.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-trust-subtitle">
            {content.trustModule.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.trustModule.items.map((item, index) => {
            const IconComponent = iconMap[item.icon] || ShieldCheck;
            return (
              <Card 
                key={index} 
                className="text-center border-2 hover:border-primary/20 transition-all"
                data-testid={`trust-item-${index}`}
              >
                <CardContent className="pt-6">
                  <div className="mx-auto p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mb-4">
                    <IconComponent className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
