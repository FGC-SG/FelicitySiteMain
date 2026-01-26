import { getSiteContent } from "@/content/site";
import { type Language } from "@/lib/i18n";
import { Target, Users, Scale, Heart, Network, Clock } from "lucide-react";

interface DifferentiatorsProps {
  language: Language;
}

const iconMap: Record<string, any> = {
  Target,
  Users,
  Scale,
  Heart,
  Network,
  Clock
};

export function Differentiators({ language }: DifferentiatorsProps) {
  const content = getSiteContent(language);

  return (
    <section className="py-20 bg-muted/30" id="differentiators">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-differentiators-title">
            {language === 'jp' ? '私たちの強み' : 'Why Choose Us'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-differentiators-subtitle">
            {language === 'jp' 
              ? 'フェリシティ・グローバル・キャピタルを選ぶ理由' 
              : 'What sets Felicity Global Capital apart'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.differentiators.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Target;
            return (
              <div 
                key={index} 
                className="flex gap-4 p-6 rounded-xl bg-background border border-border hover:shadow-md transition-all"
                data-testid={`differentiator-${index}`}
              >
                <div className="p-3 bg-primary/10 rounded-lg h-fit flex-shrink-0">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
