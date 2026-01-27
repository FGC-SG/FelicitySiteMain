import { type Language } from "@/lib/i18n";
import { TrendingUp, Globe, Leaf } from "lucide-react";

interface OurExpertiseProps {
  language: Language;
}

export function OurExpertise({ language }: OurExpertiseProps) {
  const content = {
    en: {
      title: "Our Expertise",
      subtitle: "Delivering exceptional value through focused investment strategies",
      items: [
        {
          icon: TrendingUp,
          title: "Strategic Investment",
          description: "Identifying high-potential opportunities across diverse asset classes with rigorous due diligence and proven analytical frameworks."
        },
        {
          icon: Globe,
          title: "Global Reach",
          description: "Leveraging our extensive network across Asia-Pacific to source exclusive deals and provide cross-border investment solutions."
        },
        {
          icon: Leaf,
          title: "Sustainable Growth",
          description: "Committed to responsible investing practices that create long-term value while contributing to sustainable economic development."
        }
      ]
    },
    jp: {
      title: "私たちの専門分野",
      subtitle: "集中した投資戦略を通じて卓越した価値を提供",
      items: [
        {
          icon: TrendingUp,
          title: "戦略的投資",
          description: "厳格なデューデリジェンスと実績のある分析フレームワークにより、多様な資産クラスで高いポテンシャルを持つ機会を特定します。"
        },
        {
          icon: Globe,
          title: "グローバルリーチ",
          description: "アジア太平洋地域全体に広がる広範なネットワークを活用し、独占的な案件の発掘と越境投資ソリューションを提供します。"
        },
        {
          icon: Leaf,
          title: "持続可能な成長",
          description: "持続可能な経済発展に貢献しながら、長期的な価値を創造する責任ある投資実践に取り組んでいます。"
        }
      ]
    }
  };

  const c = content[language];

  return (
    <section className="py-20 bg-secondary/30" data-testid="section-expertise">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 felicity-primary" data-testid="text-expertise-title">
            {c.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-expertise-subtitle">
            {c.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {c.items.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
              data-testid={`expertise-item-${index}`}
            >
              <div className="w-14 h-14 bg-felicity-primary/10 rounded-lg flex items-center justify-center mb-6">
                <item.icon className="h-7 w-7 felicity-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
