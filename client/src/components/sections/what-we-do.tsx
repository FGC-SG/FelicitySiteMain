import { getSiteContent } from "@/content/site";
import { type Language, useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Building2, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface WhatWeDoProps {
  language: Language;
}

const iconMap: Record<string, any> = {
  TrendingUp,
  Building2,
  BarChart3
};

export function WhatWeDo({ language }: WhatWeDoProps) {
  const content = getSiteContent(language);
  const t = useTranslation(language);

  return (
    <section className="py-20 bg-background" id="what-we-do">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-what-we-do-title">
            {language === 'jp' ? '私たちの事業' : 'What We Do'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-what-we-do-subtitle">
            {language === 'jp' 
              ? 'アジア全域での戦略的投資を通じて持続的な価値を創造します' 
              : 'Creating sustainable value through strategic investments across Asia'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.whatWeDo.map((item, index) => {
            const IconComponent = iconMap[item.icon] || TrendingUp;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                data-testid={`what-we-do-card-${index}`}
              >
                <CardHeader>
                  <div className="p-4 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {item.description}
                  </CardDescription>
                  {item.link && (
                    <Link href={item.link}>
                      <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                        {language === 'jp' ? '詳しく見る' : 'Learn More'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
