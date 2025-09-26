export interface TranslationStrings {
  nav: {
    home: string;
    about: string;
    news: string;
    portfolio: string;
    fund: string;
    fundDisclosure: string;
    article63Disclosure: string;
    contact: string;
    login: string;
    logout: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    learnMore: string;
    investmentApproach: string;
  };
  about: {
    title: string;
    philosophy: string;
    content1: string;
    content2: string;
    content3: string;
  };
  investment: {
    title: string;
    subtitle: string;
    asian: {
      title: string;
      description: string;
    };
    succession: {
      title: string;
      description: string;
    };
  };
  news: {
    title: string;
    restructuring: {
      title: string;
      description: string;
      keyChanges: string;
      singapore: string;
      japan: string;
    };
  };
  profiles: {
    title: string;
    subtitle: string;
    singapore: {
      title: string;
      chairman: string;
      capital: string;
      business: string;
    };
    japan: {
      title: string;
      ceo: string;
      capital: string;
      business: string;
    };
  };
  contact: {
    title: string;
    subtitle: string;
    form: {
      firstName: string;
      lastName: string;
      email: string;
      company: string;
      message: string;
      send: string;
    };
    singapore: string;
    tokyo: string;
    businessHours: string;
    businessHoursTime: string;
  };
  members: {
    title: string;
    subtitle: string;
    positions: {
      manager: string;
      seniorPrincipal: string;
      presidentCeo: string;
      managingDirector: string;
      managingPartner: string;
    };
    bios: {
      fujita: string;
      takano: string;
      kaneda: string;
      shimada: string;
      chouhan: string;
    };
  };
  footer: {
    description: string;
    quickLinks: string;
    contact: string;
    copyright: string;
  };
}

export const translations: Record<'en' | 'jp', TranslationStrings> = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      news: "News",
      portfolio: "Portfolio",
      fund: "Fund",
      fundDisclosure: "Japan Only",
      article63Disclosure: "Article 63 Disclosure",
      contact: "Contact",
      login: "Login",
      logout: "Logout"
    },
    hero: {
      title: "Felicity Global Capital",
      subtitle: "Creating Investment Value",
      description: "Through a New Framework of Strategic Investment Management Across Asia",
      learnMore: "Learn More About Our Vision",
      investmentApproach: "Investment Approach"
    },
    about: {
      title: "Our Philosophy",
      philosophy: "Our Philosophy",
      content1: "We have been involved in a wide range of investments—from growth investments and buyouts in Japan to various opportunities across the Asian region. Walking alongside companies in their journeys of growth and transformation, and pursuing long-term value creation together with our investors, has been a source of great pride for us.",
      content2: "Now, with Felicity Global Capital Pte. Ltd. based in Singapore and Felicity Capital Co., Ltd. in Japan as our two core entities, we have established a new corporate structure to drive our fund operations more strategically and dynamically.",
      content3: "The name Felicity means \"bliss\" or \"supreme happiness.\" It reflects our wish to deliver \"happy outcomes\" not only to our investors and portfolio companies, but also to all stakeholders—including society at large—through our investments."
    },
    investment: {
      title: "Investment Focus",
      subtitle: "Two main pillars driving strategic growth across Asia-Pacific and Japan",
      asian: {
        title: "Asian Investment Operations",
        description: "Based in Singapore, we focus on growth investments across the Asia-Pacific region, leveraging Singapore as our strategic Southeast Asian hub for identifying and nurturing emerging opportunities."
      },
      succession: {
        title: "Japanese Business Succession",
        description: "Through our subsidiary Felicity Capital Co., Ltd., we specialize in Japanese domestic business succession investments and buyout fund operations, supporting sustainable business transitions."
      }
    },
    news: {
      title: "Latest News",
      restructuring: {
        title: "Notice Regarding Changes to the ACA Group's Corporate Structure",
        description: "Effective July 31, 2025, ACA Investments Pte. Ltd. has changed its name to Felicity Global Capital Pte. Ltd., with Mr. Tomohiro Fujita assuming the role of Group Representative. This restructuring establishes a new framework for strategic and dynamic fund operations.",
        keyChanges: "Key Changes:",
        singapore: "Singapore Entity",
        japan: "Japan Entity"
      }
    },
    profiles: {
      title: "Company Profiles",
      subtitle: "Our dual-entity structure serving Asia-Pacific and Japan",
      singapore: {
        title: "Felicity Global Capital Pte. Ltd.",
        chairman: "Chairman:",
        capital: "Capital:",
        business: "Business:"
      },
      japan: {
        title: "Felicity Capital Co., Ltd.",
        ceo: "President & CEO:",
        capital: "Capital:",
        business: "Business:"
      }
    },
    contact: {
      title: "Contact Us",
      subtitle: "Get in touch with our investment team",
      form: {
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        company: "Company",
        message: "Message",
        send: "Send Message"
      },
      singapore: "Singapore Office",
      tokyo: "Tokyo Office",
      businessHours: "Business Hours",
      businessHoursTime: "Monday - Friday: 9:00 AM - 6:00 PM\nSingapore Time (SGT) / Japan Standard Time (JST)"
    },
    footer: {
      description: "Creating investment value through strategic fund management across Asia-Pacific and Japan. Building sustainable partnerships for long-term growth.",
      quickLinks: "Quick Links",
      contact: "Contact",
      copyright: "© 2025 Felicity Global Capital Pte. Ltd. All rights reserved."
    },
    members: {
      title: "Our Leadership Team",
      subtitle: "Meet the professionals driving strategic growth across Asia-Pacific and Japan",
      positions: {
        manager: "Manager",
        seniorPrincipal: "Senior Principal",
        presidentCeo: "President & CEO",
        managingDirector: "Managing Director",
        managingPartner: "Managing Partner"
      },
      bios: {
        fujita: "Leading strategic initiatives and investment management across Asia-Pacific markets with extensive experience in cross-border business development.",
        takano: "Senior investment professional with deep expertise in principal investments and strategic partnerships across Southeast Asian markets.",
        kaneda: "Directing Japanese operations with focus on business succession investments and domestic market opportunities in the Japanese market.",
        shimada: "Managing director overseeing investment operations and portfolio management with specialization in Japanese business succession.",
        chouhan: "Managing partner focused on strategic investments and business development across Asian markets."
      }
    }
  },
  jp: {
    nav: {
      home: "ホーム",
      about: "企業情報",
      news: "ニュース",
      portfolio: "ポートフォリオ",
      fund: "ファンド",
      fundDisclosure: "Japan Only",
      article63Disclosure: "金商法63条開示",
      contact: "お問い合わせ",
      login: "ログイン",
      logout: "ログアウト"
    },
    hero: {
      title: "フェリシティグローバルキャピタル",
      subtitle: "投資による価値創出",
      description: "アジア全域における戦略的投資運用の新たなフレームワークを通じて",
      learnMore: "私たちのビジョンについて",
      investmentApproach: "投資アプローチ"
    },
    about: {
      title: "私たちの理念",
      philosophy: "私たちの理念",
      content1: "私たちはこれまで、国内そしてアジア地域における成長投資、バイアウト投資等幅広い分野において、数多くの投資に携わってまいりました。企業の成長や変革の過程に寄り添いながら、投資家の皆様とともに長期的な価値創出を追求してきたことは、私たちの大きな誇りです。",
      content2: "そしてこのたび、シンガポールを本拠とするFelicity Global Capital Pte. Ltd.と、日本の株式会社Felicity Capitalの2社を両輪とし、アジア企業への投資と日本国内の事業承継投資という二つの投資事業を軸に、より戦略的かつ機動的にファンド運営を推進していく新たな体制を整えました。",
      content3: "Felicity（フェリシティ）という名前には、「至福」や「この上ない幸福」といった意味があります。この社名には、投資を通じて、投資家、投資先企業をはじめとするステークスホルダーはもとより、社会全体にとって、\"幸せな結果\"をもたらしたいという私たちの想いが込められています。"
    },
    investment: {
      title: "投資分野",
      subtitle: "アジア太平洋地域と日本における戦略的成長を推進する二つの柱",
      asian: {
        title: "アジア投資事業",
        description: "シンガポールを拠点とし、アジア太平洋地域全体の成長投資に焦点を当て、シンガポールを東南アジアの戦略的拠点として新興機会の発掘と育成を行っています。"
      },
      succession: {
        title: "日本の事業承継",
        description: "子会社である株式会社Felicity Capitalを通じて、日本国内の事業承継投資とバイアウトファンド運営を専門とし、持続可能な事業承継をサポートしています。"
      }
    },
    news: {
      title: "最新ニュース",
      restructuring: {
        title: "ACAグループの体制（社名・代表者等）変更に関するお知らせ",
        description: "2025年7月31日付で、ACA Investments Pte. Ltd.はFelicity Global Capital Pte. Ltd.へ社名変更し、藤田智弘がグループ代表に就任いたします。この再編により、戦略的かつ機動的なファンド運営の新たなフレームワークが確立されます。",
        keyChanges: "主な変更点：",
        singapore: "シンガポール法人",
        japan: "日本法人"
      }
    },
    profiles: {
      title: "会社概要",
      subtitle: "アジア太平洋地域と日本にサービスを提供する二社体制",
      singapore: {
        title: "Felicity Global Capital Pte. Ltd.",
        chairman: "代表:",
        capital: "資本金:",
        business: "事業内容:"
      },
      japan: {
        title: "株式会社Felicity Capital",
        ceo: "代表取締役:",
        capital: "資本金:",
        business: "事業内容:"
      }
    },
    contact: {
      title: "お問い合わせ",
      subtitle: "投資チームにご連絡ください",
      form: {
        firstName: "名",
        lastName: "姓",
        email: "メールアドレス",
        company: "会社名",
        message: "メッセージ",
        send: "送信"
      },
      singapore: "シンガポールオフィス",
      tokyo: "東京オフィス",
      businessHours: "営業時間",
      businessHoursTime: "月曜日〜金曜日: 午前9:00〜午後6:00\nシンガポール時間 (SGT) / 日本標準時 (JST)"
    },
    footer: {
      description: "アジア太平洋地域と日本における戦略的ファンド運営を通じた投資価値の創出。持続可能な成長のためのパートナーシップの構築。",
      quickLinks: "クイックリンク",
      contact: "お問い合わせ",
      copyright: "© 2025 Felicity Global Capital Pte. Ltd. All rights reserved."
    },
    members: {
      title: "リーダーシップチーム",
      subtitle: "アジア太平洋地域と日本での戦略的成長を推進する専門家チーム",
      positions: {
        manager: "マネージャー",
        seniorPrincipal: "シニアプリンシパル",
        presidentCeo: "代表取締役",
        managingDirector: "マネージングディレクター",
        managingPartner: "マネージングパートナー"
      },
      bios: {
        fujita: "アジア太平洋市場での戦略的イニシアティブと投資管理をリードし、クロスボーダーのビジネス開発において豊富な経験を持っています。",
        takano: "東南アジア市場でのプリンシパル投資と戦略的パートナーシップの深い専門知識を持つシニア投資プロフェッショナルです。",
        kaneda: "日本市場での事業承継投資と国内市場機会に焦点を当て、日本事業を指揮しています。",
        shimada: "日本の事業承継を専門とし、投資業務とポートフォリオマネジメントを監督するマネージングディレクターです。",
        chouhan: "アジア市場での戦略的投資とビジネス開発に焦点を当てたマネージングパートナーです。"
      }
    }
  }
};

export type Language = 'en' | 'jp';

export function useTranslation(language: Language = 'en') {
  return translations[language];
}
