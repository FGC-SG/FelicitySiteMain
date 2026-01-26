export interface SiteContent {
  positioning: {
    statement: string;
    hero: {
      headline: string;
      subheadline: string;
      description: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
  };
  proofPoints: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  whatWeDo: Array<{
    icon: string;
    title: string;
    description: string;
    link?: string;
  }>;
  differentiators: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  trustModule: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  ctaBand: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
}

export const siteContent: Record<'en' | 'jp', SiteContent> = {
  en: {
    positioning: {
      statement: "Felicity Global Capital: Strategic investment management delivering long-term value creation across Asia-Pacific through disciplined investment processes and deep regional expertise.",
      hero: {
        headline: "Strategic Investment Value Across Asia-Pacific",
        subheadline: "Long-term value creation through disciplined investment management and deep regional expertise",
        description: "Felicity Global Capital partners with companies and investors to drive sustainable growth through strategic investments across diverse Asian markets.",
        ctaPrimary: "Explore Our Approach",
        ctaSecondary: "Contact Us"
      }
    },
    proofPoints: [
      {
        icon: "Globe",
        title: "Asia-Pacific Focus",
        description: "Strategic presence in Singapore and Japan"
      },
      {
        icon: "Shield",
        title: "Disciplined Process",
        description: "Rigorous investment framework"
      },
      {
        icon: "Handshake",
        title: "Partnership Approach",
        description: "Long-term value alignment"
      }
    ],
    whatWeDo: [
      {
        icon: "TrendingUp",
        title: "Growth Investments",
        description: "Strategic capital deployment across Asian markets, supporting companies through expansion and transformation phases.",
        link: "/portfolio"
      },
      {
        icon: "Building2",
        title: "Business Succession",
        description: "Specialized buyout and succession solutions for established Japanese companies seeking sustainable transitions.",
        link: "/fund"
      },
      {
        icon: "BarChart3",
        title: "Fund Management",
        description: "Professional fund operations with transparent governance and strategic allocation across diverse investment opportunities.",
        link: "/fund"
      }
    ],
    differentiators: [
      {
        icon: "Target",
        title: "Focused Regional Expertise",
        description: "Deep understanding of Asia-Pacific markets with on-the-ground presence in key financial centers."
      },
      {
        icon: "Users",
        title: "Experienced Leadership",
        description: "Senior team with decades of combined experience in private equity and corporate finance across Asia."
      },
      {
        icon: "Scale",
        title: "Disciplined Investment Process",
        description: "Rigorous due diligence and structured decision-making frameworks ensuring consistent, risk-adjusted returns."
      },
      {
        icon: "Heart",
        title: "Stakeholder Alignment",
        description: "Commitment to creating value for investors, portfolio companies, and broader society through responsible investing."
      },
      {
        icon: "Network",
        title: "Dual-Entity Structure",
        description: "Singapore and Japan entities working in concert to capture opportunities across multiple jurisdictions."
      },
      {
        icon: "Clock",
        title: "Long-Term Orientation",
        description: "Patient capital approach focused on sustainable value creation rather than short-term gains."
      }
    ],
    trustModule: {
      title: "Governance & Compliance",
      subtitle: "Built on a foundation of transparency and regulatory adherence",
      items: [
        {
          icon: "FileCheck",
          title: "Regulatory Framework",
          description: "Operating within established regulatory frameworks across Singapore and Japan jurisdictions."
        },
        {
          icon: "Lock",
          title: "Risk Management",
          description: "Comprehensive risk assessment and monitoring integrated throughout our investment process."
        },
        {
          icon: "Eye",
          title: "Transparency",
          description: "Regular reporting and open communication with investors on portfolio performance and developments."
        },
        {
          icon: "ShieldCheck",
          title: "Governance Standards",
          description: "Strong internal governance with independent oversight and clear accountability structures."
        }
      ]
    },
    ctaBand: {
      title: "Ready to Explore Investment Opportunities?",
      subtitle: "Connect with our team to discuss how we can work together",
      ctaPrimary: "Contact Us",
      ctaSecondary: "Learn More About Us"
    }
  },
  jp: {
    positioning: {
      statement: "フェリシティ・グローバル・キャピタル：アジア太平洋地域における規律ある投資プロセスと深い地域専門知識を通じた長期的価値創造を実現する戦略的投資運用会社。",
      hero: {
        headline: "アジア太平洋における戦略的投資価値",
        subheadline: "規律ある投資運用と深い地域専門知識による長期的価値創造",
        description: "フェリシティ・グローバル・キャピタルは、アジア全域の多様な市場への戦略的投資を通じて、企業と投資家の持続的成長を支援します。",
        ctaPrimary: "投資アプローチを見る",
        ctaSecondary: "お問い合わせ"
      }
    },
    proofPoints: [
      {
        icon: "Globe",
        title: "アジア太平洋フォーカス",
        description: "シンガポールと日本における戦略的拠点"
      },
      {
        icon: "Shield",
        title: "規律あるプロセス",
        description: "厳格な投資フレームワーク"
      },
      {
        icon: "Handshake",
        title: "パートナーシップ",
        description: "長期的な価値の整合"
      }
    ],
    whatWeDo: [
      {
        icon: "TrendingUp",
        title: "成長投資",
        description: "アジア市場全体への戦略的資本投入により、企業の拡大・変革フェーズを支援します。",
        link: "/portfolio"
      },
      {
        icon: "Building2",
        title: "事業承継",
        description: "持続可能な事業移行を求める日本企業向けの専門的なバイアウト・承継ソリューション。",
        link: "/fund"
      },
      {
        icon: "BarChart3",
        title: "ファンド運用",
        description: "透明性のあるガバナンスと多様な投資機会への戦略的配分によるプロフェッショナルなファンド運営。",
        link: "/fund"
      }
    ],
    differentiators: [
      {
        icon: "Target",
        title: "地域専門知識",
        description: "主要金融センターでの現地プレゼンスを持つ、アジア太平洋市場への深い理解。"
      },
      {
        icon: "Users",
        title: "経験豊富なリーダーシップ",
        description: "アジア全域でのプライベートエクイティとコーポレートファイナンスにおける数十年の経験を持つシニアチーム。"
      },
      {
        icon: "Scale",
        title: "規律ある投資プロセス",
        description: "一貫したリスク調整後リターンを確保するための厳格なデューデリジェンスと構造化された意思決定フレームワーク。"
      },
      {
        icon: "Heart",
        title: "ステークホルダーとの整合",
        description: "責任ある投資を通じて、投資家、ポートフォリオ企業、そして社会全体に価値を創造するコミットメント。"
      },
      {
        icon: "Network",
        title: "二拠点体制",
        description: "シンガポールと日本の事業体が連携し、複数の法域にわたる機会を捉えます。"
      },
      {
        icon: "Clock",
        title: "長期志向",
        description: "短期的な利益ではなく、持続可能な価値創造に焦点を当てた忍耐強い資本アプローチ。"
      }
    ],
    trustModule: {
      title: "ガバナンスとコンプライアンス",
      subtitle: "透明性と規制遵守の基盤の上に構築",
      items: [
        {
          icon: "FileCheck",
          title: "規制フレームワーク",
          description: "シンガポールと日本の両法域において確立された規制フレームワーク内で運営。"
        },
        {
          icon: "Lock",
          title: "リスク管理",
          description: "投資プロセス全体に統合された包括的なリスク評価とモニタリング。"
        },
        {
          icon: "Eye",
          title: "透明性",
          description: "ポートフォリオのパフォーマンスと動向に関する投資家への定期的な報告とオープンなコミュニケーション。"
        },
        {
          icon: "ShieldCheck",
          title: "ガバナンス基準",
          description: "独立した監督と明確な説明責任構造を持つ強固な内部ガバナンス。"
        }
      ]
    },
    ctaBand: {
      title: "投資機会を検討する準備はできていますか？",
      subtitle: "どのように協力できるか、私たちのチームとご相談ください",
      ctaPrimary: "お問い合わせ",
      ctaSecondary: "会社概要を見る"
    }
  }
};

export function getSiteContent(language: 'en' | 'jp'): SiteContent {
  return siteContent[language];
}
