import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { type Member } from "@shared/schema";
import { Users } from "lucide-react";

interface MembersProps {
  language: Language;
}

const staticMembers = [
  {
    id: "static-1",
    name: "Managing Director",
    nameJa: "代表取締役",
    title: "Managing Director & CEO",
    titleJa: "代表取締役社長・CEO",
    company: "Felicity Global Capital Pte. Ltd.",
    companyJa: "フェリシティ・グローバル・キャピタル",
    bio: "Seasoned investment professional with 20+ years of experience in Asia-Pacific private equity and corporate finance.",
    bioJa: "アジア太平洋地域のプライベートエクイティおよびコーポレートファイナンスに20年以上の経験を持つ投資専門家。",
    photoUrl: null,
    isVisible: true,
    displayOrder: 1,
  },
  {
    id: "static-2",
    name: "Investment Director",
    nameJa: "投資ディレクター",
    title: "Director, Investments",
    titleJa: "投資本部長",
    company: "Felicity Global Capital Pte. Ltd.",
    companyJa: "フェリシティ・グローバル・キャピタル",
    bio: "Specialist in cross-border M&A and business succession transactions across Japan and Southeast Asia.",
    bioJa: "日本および東南アジア全域における越境M&Aおよびビジネス承継取引の専門家。",
    photoUrl: null,
    isVisible: true,
    displayOrder: 2,
  },
  {
    id: "static-3",
    name: "Head of Fund Operations",
    nameJa: "ファンドオペレーション責任者",
    title: "Head of Fund Operations",
    titleJa: "ファンドオペレーション部長",
    company: "Felicity Global Capital Pte. Ltd.",
    companyJa: "フェリシティ・グローバル・キャピタル",
    bio: "Expert in fund administration, investor relations, and regulatory compliance under the MAS framework.",
    bioJa: "MAS規制の下でのファンド管理、投資家関係、および規制コンプライアンスの専門家。",
    photoUrl: null,
    isVisible: true,
    displayOrder: 3,
  },
];

export function Members({ language }: MembersProps) {
  const t = useTranslation(language);

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
    retry: false,
  });

  const sortedMembers = members
    ? [...members]
        .filter(member => member.isVisible !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : [];

  const displayMembers = sortedMembers.length > 0 ? sortedMembers : (!isLoading ? staticMembers : []);

  const AvatarPlaceholder = ({ id }: { id: string | number }) => (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-primary/10 mx-auto"
      style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)" }}
      data-testid={`placeholder-member-photo-${id}`}
    >
      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="22" r="12" fill="rgba(255,255,255,0.35)" />
        <ellipse cx="32" cy="52" rx="20" ry="12" fill="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  );

  return (
    <section id="members" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-members-title">
            {t.members.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6" data-testid="text-members-subtitle">
            {t.members.subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">
              {language === "en" ? "Loading team members..." : "チームメンバーを読み込み中..."}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
              {displayMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card rounded-xl p-6 shadow-lg border border-border text-center"
                  data-testid={`card-member-${member.id}`}
                >
                  <div className="mb-6">
                    <div className="flex justify-center mb-4">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={language === "jp" && member.nameJa ? member.nameJa : member.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-primary/10"
                          data-testid={`img-member-photo-${member.id}`}
                        />
                      ) : (
                        <AvatarPlaceholder id={member.id} />
                      )}
                    </div>
                    <h3
                      className="text-xl font-bold felicity-primary mb-2"
                      data-testid={`text-member-name-${member.id}`}
                    >
                      {language === "jp" && member.nameJa ? member.nameJa : member.name}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground font-medium mb-1"
                      data-testid={`text-member-position-${member.id}`}
                    >
                      {language === "jp" && member.titleJa ? member.titleJa : member.title}
                    </p>
                    <p
                      className="text-xs text-muted-foreground mb-4"
                      data-testid={`text-member-company-${member.id}`}
                    >
                      {language === "jp" && member.companyJa ? member.companyJa : member.company}
                    </p>
                  </div>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed text-left"
                    data-testid={`text-member-bio-${member.id}`}
                  >
                    {language === "jp" && member.bioJa ? member.bioJa : member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
