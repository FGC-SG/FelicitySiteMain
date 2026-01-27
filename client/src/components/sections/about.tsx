import { useTranslation, type Language } from "@/lib/i18n";
import modernBoardroomImage from "@assets/generated_images/boardroom_10-seater_table_mbs_view.png";
import { Calendar, TrendingUp, Building2, Users, Shield, Handshake } from "lucide-react";

interface AboutProps {
  language: Language;
}

export function About({ language }: AboutProps) {
  const t = useTranslation(language);

  const stats = {
    en: [
      { value: "15+", label: "Years Experience", icon: Calendar },
      { value: "$500M+", label: "Assets Under Management", icon: TrendingUp },
      { value: "50+", label: "Portfolio Companies", icon: Building2 },
    ],
    jp: [
      { value: "15+", label: "年の経験", icon: Calendar },
      { value: "$5億+", label: "運用資産", icon: TrendingUp },
      { value: "50+", label: "ポートフォリオ企業", icon: Building2 },
    ]
  };

  const differentiators = {
    en: [
      { icon: Users, title: "Expert Team", description: "Seasoned professionals with deep industry expertise across Asia-Pacific markets" },
      { icon: Shield, title: "Rigorous Process", description: "Disciplined investment approach with comprehensive due diligence and risk management" },
      { icon: Handshake, title: "Partnership Focus", description: "Long-term value creation through active partnership with portfolio companies" },
    ],
    jp: [
      { icon: Users, title: "専門家チーム", description: "アジア太平洋市場で深い業界知識を持つ経験豊富なプロフェッショナル" },
      { icon: Shield, title: "厳格なプロセス", description: "包括的なデューデリジェンスとリスク管理を備えた規律ある投資アプローチ" },
      { icon: Handshake, title: "パートナーシップ重視", description: "ポートフォリオ企業との積極的なパートナーシップを通じた長期的価値創造" },
    ]
  };

  const currentStats = stats[language];
  const currentDifferentiators = differentiators[language];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src={modernBoardroomImage}
              alt="Modern corporate boardroom in Singapore"
              className="rounded-xl shadow-2xl"
              data-testid="img-boardroom"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold felicity-primary mb-6" data-testid="text-about-title">
              {t.about.title}
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p data-testid="text-about-content1">{t.about.content1}</p>
              <p data-testid="text-about-content2">{t.about.content2}</p>
              <p data-testid="text-about-content3">
                {t.about.content3.split('"').map((part, index) => {
                  if (index === 1) {
                    return (
                      <strong key={index} className="felicity-primary">
                        "Felicity"
                      </strong>
                    );
                  }
                  if (index === 3) {
                    return (
                      <strong key={index} className="felicity-primary">
                        "happy outcomes"
                      </strong>
                    );
                  }
                  return part;
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="bg-felicity-primary/5 rounded-2xl p-8 mb-16" data-testid="about-stats-bar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentStats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-item-${index}`}>
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-felicity-primary/10 rounded-full flex items-center justify-center">
                    <stat.icon className="h-6 w-6 felicity-primary" />
                  </div>
                </div>
                <div className="text-4xl font-bold felicity-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Differentiators */}
        <div data-testid="about-differentiators">
          <h3 className="text-2xl font-bold text-center felicity-primary mb-10">
            {language === 'jp' ? '私たちの強み' : 'Why Partner With Us'}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {currentDifferentiators.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                data-testid={`differentiator-${index}`}
              >
                <div className="w-14 h-14 bg-felicity-gold/10 rounded-lg flex items-center justify-center mb-5">
                  <item.icon className="h-7 w-7 text-felicity-gold" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-foreground">{item.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
