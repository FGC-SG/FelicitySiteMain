import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { type Member } from "@shared/schema";

interface MembersProps {
  language: Language;
}

export function Members({ language }: MembersProps) {
  const t = useTranslation(language);

  // Fetch members from the database
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
    retry: false,
  });

  // Sort members by display order
  const sortedMembers = members ? [...members].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) : [];

  return (
    <section id="members" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-members-title">
            {t.members.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-members-subtitle">
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
        ) : sortedMembers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {sortedMembers.map((member, index) => (
              <div key={member.id} className="bg-card rounded-xl p-6 shadow-lg border border-border text-center" data-testid={`card-member-${member.id}`}>
                <div className="mb-6">
                  <img
                    src={member.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
                    data-testid={`img-member-${member.id}`}
                  />
                  <h3 className="text-xl font-bold felicity-primary mb-2" data-testid={`text-member-name-${member.id}`}>
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium mb-1" data-testid={`text-member-position-${member.id}`}>
                    {member.title}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4" data-testid={`text-member-company-${member.id}`}>
                    {member.company}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-member-bio-${member.id}`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === "en" ? "No team members found." : "チームメンバーが見つかりません。"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}