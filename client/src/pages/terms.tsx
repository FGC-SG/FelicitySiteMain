import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { useState } from "react";

export default function TermsPage() {
  const [language, setLanguage] = useState<Language>("en");

  const content = {
    en: {
      title: "Terms of Use",
      lastUpdated: "Last updated: January 27, 2026",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: `By accessing and using this website operated by Felicity Global Capital Pte. Ltd. ("Company", "we", "us", or "our"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this website.`
        },
        {
          title: "2. Use of Website",
          content: `This website is provided for informational purposes only. The information contained herein does not constitute an offer or solicitation to buy or sell any securities or investment products. You agree to use this website only for lawful purposes and in accordance with these Terms of Use.`
        },
        {
          title: "3. Intellectual Property",
          content: `All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Felicity Global Capital Pte. Ltd. or its content suppliers and is protected by Singapore and international copyright laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.`
        },
        {
          title: "4. Investment Disclaimers",
          content: `The information on this website is not intended as investment advice, tax advice, or legal advice. Past performance is not indicative of future results. Investments involve risks, including the possible loss of principal. Before making any investment decisions, you should consult with qualified financial, legal, and tax advisors.`
        },
        {
          title: "5. No Warranties",
          content: `This website and its content are provided "as is" without warranties of any kind, either express or implied. We do not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components. We make no representations about the accuracy, reliability, completeness, or timeliness of the content.`
        },
        {
          title: "6. Limitation of Liability",
          content: `To the fullest extent permitted by law, Felicity Global Capital Pte. Ltd. shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of this website or reliance on any information provided herein.`
        },
        {
          title: "7. Third-Party Links",
          content: `This website may contain links to third-party websites. These links are provided for your convenience only. We have no control over the content of linked websites and assume no responsibility for their content, privacy policies, or practices.`
        },
        {
          title: "8. Confidentiality",
          content: `Any non-public information provided to us through this website shall be treated as confidential and will be used solely for the purposes for which it was provided, subject to applicable laws and regulations.`
        },
        {
          title: "9. Regulatory Information",
          content: `Felicity Global Capital Pte. Ltd. is a Capital Markets Services Licensee (Fund Management) regulated by the Monetary Authority of Singapore (MAS). Our services are subject to applicable Singapore financial regulations.`
        },
        {
          title: "10. Governing Law",
          content: `These Terms of Use shall be governed by and construed in accordance with the laws of Singapore. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts of Singapore.`
        },
        {
          title: "11. Modifications",
          content: `We reserve the right to modify these Terms of Use at any time without prior notice. Your continued use of this website after any changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.`
        },
        {
          title: "12. Contact Information",
          content: `If you have any questions about these Terms of Use, please contact us at:\n\nFelicity Global Capital Pte. Ltd.\n6 Temasek Blvd #29-04 Suntec Tower Four\nSingapore 038986\nEmail: info@fgcsg.com\nPhone: +65-6890-0730`
        }
      ]
    },
    jp: {
      title: "利用規約",
      lastUpdated: "最終更新日: 2026年1月27日",
      sections: [
        {
          title: "1. 規約への同意",
          content: `Felicity Global Capital Pte. Ltd.（以下「当社」）が運営する本ウェブサイトにアクセスし、利用することにより、お客様は本利用規約に拘束されることに同意したものとみなされます。本規約に同意されない場合は、本ウェブサイトをご利用にならないでください。`
        },
        {
          title: "2. ウェブサイトの利用",
          content: `本ウェブサイトは情報提供のみを目的として提供されています。本ウェブサイトに含まれる情報は、有価証券または投資商品の売買の申し出または勧誘を構成するものではありません。お客様は、本ウェブサイトを合法的な目的のためにのみ、かつ本利用規約に従って利用することに同意するものとします。`
        },
        {
          title: "3. 知的財産権",
          content: `本ウェブサイト上のすべてのコンテンツ（テキスト、グラフィック、ロゴ、画像、ソフトウェアを含むがこれらに限定されない）は、Felicity Global Capital Pte. Ltd.またはそのコンテンツ提供者の財産であり、シンガポールおよび国際著作権法により保護されています。当社の事前の書面による同意なく、コンテンツを複製、配布、変更、または派生物を作成することはできません。`
        },
        {
          title: "4. 投資に関する免責事項",
          content: `本ウェブサイトの情報は、投資アドバイス、税務アドバイス、または法的アドバイスを意図したものではありません。過去のパフォーマンスは将来の結果を示すものではありません。投資にはリスクが伴い、元本を失う可能性があります。投資決定を行う前に、適格な金融、法律、税務アドバイザーにご相談ください。`
        },
        {
          title: "5. 保証の否認",
          content: `本ウェブサイトおよびそのコンテンツは、明示または黙示を問わず、いかなる種類の保証もなく「現状のまま」提供されます。当社は、本ウェブサイトが中断されないこと、エラーがないこと、またはウイルスやその他の有害なコンポーネントがないことを保証しません。`
        },
        {
          title: "6. 責任の制限",
          content: `法律で許容される最大限の範囲において、Felicity Global Capital Pte. Ltd.は、本ウェブサイトの利用または本ウェブサイトで提供される情報への依拠に起因または関連する直接的、間接的、偶発的、特別、結果的、または懲罰的損害について責任を負いません。`
        },
        {
          title: "7. 第三者リンク",
          content: `本ウェブサイトには第三者ウェブサイトへのリンクが含まれる場合があります。これらのリンクはお客様の便宜のためにのみ提供されています。当社はリンク先ウェブサイトのコンテンツを管理しておらず、そのコンテンツ、プライバシーポリシー、または慣行について責任を負いません。`
        },
        {
          title: "8. 機密保持",
          content: `本ウェブサイトを通じて当社に提供された非公開情報は機密として扱われ、適用される法令に従い、提供された目的のためにのみ使用されます。`
        },
        {
          title: "9. 規制情報",
          content: `Felicity Global Capital Pte. Ltd.はシンガポール金融管理局（MAS）により規制された資本市場サービスライセンス保有者（ファンドマネジメント）です。当社のサービスは、適用されるシンガポールの金融規制の対象となります。`
        },
        {
          title: "10. 準拠法",
          content: `本利用規約はシンガポール法に準拠し、シンガポール法に従って解釈されるものとします。本規約に起因または関連する紛争は、シンガポールの裁判所の専属管轄に服するものとします。`
        },
        {
          title: "11. 変更",
          content: `当社は、事前の通知なく、いつでも本利用規約を変更する権利を留保します。変更後も本ウェブサイトを継続して利用することにより、お客様は新しい規約を承諾したものとみなされます。定期的に本規約を確認されることをお勧めします。`
        },
        {
          title: "12. お問い合わせ",
          content: `本利用規約についてご質問がある場合は、以下までお問い合わせください：\n\nFelicity Global Capital Pte. Ltd.\n6 Temasek Blvd #29-04 Suntec Tower Four\nSingapore 038986\nメール: info@fgcsg.com\n電話: +65-6890-0730`
        }
      ]
    }
  };

  const c = content[language];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20">
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-terms-title">
                {c.title}
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-terms-subtitle">
                {c.lastUpdated}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="space-y-8">
                {c.sections.map((section, index) => (
                  <section key={index}>
                    <h2 className="text-2xl font-bold felicity-primary mb-4">{section.title}</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{section.content}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer language={language} />
    </div>
  );
}
