import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { type Language } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Shield, DollarSign } from "lucide-react";

export default function FundDisclosurePage() {
  const [language, setLanguage] = useState<Language>('en');

  const t = {
    title: language === 'jp' ? "運用報告書（Web公開用）" : "Fund Disclosure Report",
    subtitle: language === 'jp' ? "適格機関投資家等特例業務に基づく運用報告書" : "Investment Management Report for Professional Investors",
    lastUpdated: language === 'jp' ? "最終更新日" : "Last Updated",
    
    // Section 1: Fund Overview
    section1Title: language === 'jp' ? "ファンドの概要" : "Fund Overview",
    fundName: language === 'jp' ? "ファンド名称：" : "Fund Name:",
    fundNameValue: language === 'jp' ? "フェリシティ・グローバル・キャピタル投資事業有限責任組合" : "Felicity Global Capital Investment Limited Partnership",
    legalBasis: language === 'jp' ? "根拠法令：" : "Legal Basis:",
    legalBasisValue: language === 'jp' ? "適格機関投資家等特例業務（金融商品取引法第63条）" : "Professional Investor Special Provisions (Financial Instruments and Exchange Act Article 63)",
    inceptionDate: language === 'jp' ? "運用開始日：" : "Inception Date:",
    inceptionDateValue: language === 'jp' ? "2020年4月1日" : "April 1, 2020",
    investmentAssets: language === 'jp' ? "投資対象資産：" : "Investment Assets:",
    investmentAssetsValue: language === 'jp' ? "上場株式、未公開株式、不動産関連資産 等" : "Listed securities, private equity, real estate assets, etc.",

    // Section 2: Investment Policy
    section2Title: language === 'jp' ? "投資方針" : "Investment Policy",
    policy1: language === 'jp' ? "中長期的なキャピタルゲインを重視" : "Focus on long-term capital gains",
    policy2: language === 'jp' ? "セクター分散を基本方針（テクノロジー、ヘルスケア、金融サービス等）" : "Sector diversification strategy (Technology, Healthcare, Financial Services, etc.)",
    policy3: language === 'jp' ? "デリバティブはヘッジ目的に限定" : "Derivatives limited to hedging purposes only",

    // Section 3: Performance
    section3Title: language === 'jp' ? "運用実績（対象期間）" : "Performance Results (Period)",
    beginningBalance: language === 'jp' ? "期首残高" : "Beginning Balance",
    additionalContributions: language === 'jp' ? "期中追加出資" : "Additional Contributions",
    distributions: language === 'jp' ? "期中分配" : "Distributions",
    endingBalance: language === 'jp' ? "期末残高" : "Ending Balance",
    nav: language === 'jp' ? "純資産総額（NAV）" : "Net Asset Value (NAV)",
    returns: language === 'jp' ? "収益率（期間リターン）" : "Return Rate (Period Return)",

    // Section 4: Major Investments
    section4Title: language === 'jp' ? "主な投資先の状況" : "Major Investment Holdings",
    investment1: language === 'jp' ? "上場株式：テクノロジーセクター … 投資額50億円、評価益15億円" : "Listed Equity: Technology Sector ... Investment: ¥5.0B, Unrealized Gain: ¥1.5B",
    investment2: language === 'jp' ? "未公開株式：ヘルスケア関連企業 … 投資額30億円、評価益8億円" : "Private Equity: Healthcare Companies ... Investment: ¥3.0B, Unrealized Gain: ¥0.8B",
    investment3: language === 'jp' ? "不動産投資：アジア太平洋地域商業施設 … 投資額20億円、評価益5億円" : "Real Estate: Asia-Pacific Commercial Properties ... Investment: ¥2.0B, Unrealized Gain: ¥0.5B",

    // Section 5: Fund Size
    section5Title: language === 'jp' ? "ファンド規模" : "Fund Size",
    totalCommitments: language === 'jp' ? "出資総額：" : "Total Commitments:",
    totalCommitmentsValue: language === 'jp' ? "150億円" : "¥15.0 billion",
    numberOfInvestors: language === 'jp' ? "出資者数：" : "Number of Investors:",
    numberOfInvestorsValue: language === 'jp' ? "25名（うち適格機関投資家23名、非適格投資家2名）" : "25 investors (23 professional investors, 2 non-professional investors)",

    // Section 6: Fees
    section6Title: language === 'jp' ? "手数料・報酬" : "Fees & Compensation",
    managementFee: language === 'jp' ? "管理報酬：出資総額の年2.0％" : "Management Fee: 2.0% per annum of committed capital",
    performanceFee: language === 'jp' ? "成功報酬：ハードルレート8％を超える利益の20％" : "Performance Fee: 20% of profits exceeding 8% hurdle rate",

    // Section 7: Risk Information
    section7Title: language === 'jp' ? "リスク情報" : "Risk Information",
    risk1: language === 'jp' ? "市場変動リスク（株価・金利・為替の変動による影響）" : "Market Risk (impact of equity, interest rate, and currency fluctuations)",
    risk2: language === 'jp' ? "流動性リスク（未公開株・不動産の換金困難性）" : "Liquidity Risk (difficulty in monetizing private equity and real estate assets)",
    risk3: language === 'jp' ? "信用リスク（投資先企業の財務悪化）" : "Credit Risk (deterioration of portfolio company financials)",
    risk4: language === 'jp' ? "その他法的・税務上の変更リスク" : "Legal and tax regulatory change risks",

    // Section 8: Future Investment Policy
    section8Title: language === 'jp' ? "今後の運用方針" : "Future Investment Strategy",
    future1: language === 'jp' ? "アジア太平洋地域の投資機会を引き続き探索" : "Continue exploring investment opportunities in Asia-Pacific region",
    future2: language === 'jp' ? "ポートフォリオの分散強化" : "Strengthen portfolio diversification",
    future3: language === 'jp' ? "投資先とのエンゲージメント強化" : "Enhance engagement with portfolio companies",

    // Section 9: Disclaimers
    section9Title: language === 'jp' ? "特記事項" : "Important Notes",
    disclaimer: language === 'jp' 
      ? "本運用報告書は金融商品取引法63条に基づき作成したものです。本資料は情報提供を目的とし、将来の成果を保証するものではありません。投資にはリスクが伴い、元本割れの可能性があることをご理解ください。"
      : "This investment report is prepared in accordance with Article 63 of the Financial Instruments and Exchange Act. This material is for informational purposes only and does not guarantee future performance. Please understand that investments involve risks and may result in principal losses."
  };

  const performanceData = [
    { label: t.beginningBalance, value: language === 'jp' ? "120億円" : "¥12.0 billion" },
    { label: t.additionalContributions, value: language === 'jp' ? "30億円" : "¥3.0 billion" },
    { label: t.distributions, value: language === 'jp' ? "10億円" : "¥1.0 billion" },
    { label: t.endingBalance, value: language === 'jp' ? "168億円" : "¥16.8 billion" },
    { label: t.nav, value: language === 'jp' ? "168億円" : "¥16.8 billion" },
    { label: t.returns, value: language === 'jp' ? "12.0%" : "12.0%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="text-fund-disclosure-title">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {t.subtitle}
            </p>
            <p className="text-sm text-gray-500">
              {t.lastUpdated}: <time dateTime="2025-09-25">2025-09-25</time>
            </p>
          </div>

          {/* Section 1: Fund Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                1. {t.section1Title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div><strong>{t.fundName}</strong> {t.fundNameValue}</div>
                <div><strong>{t.legalBasis}</strong> {t.legalBasisValue}</div>
                <div><strong>{t.inceptionDate}</strong> {t.inceptionDateValue}</div>
                <div><strong>{t.investmentAssets}</strong> {t.investmentAssetsValue}</div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Investment Policy */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                2. {t.section2Title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                <li>{t.policy1}</li>
                <li>{t.policy2}</li>
                <li>{t.policy3}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3: Performance Results */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. {t.section3Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    {performanceData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-2/5">
                          {item.label}
                        </td>
                        <td className="p-3">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Major Investments */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. {t.section4Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                <li>{t.investment1}</li>
                <li>{t.investment2}</li>
                <li>{t.investment3}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5: Fund Size */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>5. {t.section5Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>{t.totalCommitments}</strong> {t.totalCommitmentsValue}</div>
                <div><strong>{t.numberOfInvestors}</strong> {t.numberOfInvestorsValue}</div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Fees */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. {t.section6Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                <li>{t.managementFee}</li>
                <li>{t.performanceFee}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7: Risk Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                7. {t.section7Title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                <li>{t.risk1}</li>
                <li>{t.risk2}</li>
                <li>{t.risk3}</li>
                <li>{t.risk4}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8: Future Investment Strategy */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>8. {t.section8Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside">
                <li>{t.future1}</li>
                <li>{t.future2}</li>
                <li>{t.future3}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 9: Disclaimers */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>9. {t.section9Title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {t.disclaimer}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}