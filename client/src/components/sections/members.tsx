import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { type Member } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface MembersProps {
  language: Language;
}

export function Members({ language }: MembersProps) {
  const t = useTranslation(language);
  const [reverseOrder, setReverseOrder] = useState(false);

  // Fetch members from the database
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
    retry: false,
  });

  // Sort members by display order
  let sortedMembers = members 
    ? [...members]
        .filter(member => member.isVisible !== false)  // Only show visible members
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) 
    : [];
  if (reverseOrder) {
    sortedMembers = sortedMembers.reverse();
  }

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
          <Button 
            onClick={() => setReverseOrder(!reverseOrder)}
            variant="outline"
            className="gap-2"
            data-testid="button-reverse-members-order"
          >
            <ArrowUpDown className="h-4 w-4" />
            {language === "en" 
              ? (reverseOrder ? "Normal Order" : "Reverse Order")
              : (reverseOrder ? "通常順序" : "逆順序")
            }
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">
              {language === "en" ? "Loading team members..." : "チームメンバーを読み込み中..."}
            </p>
          </div>
        ) : sortedMembers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedMembers.map((member, index) => (
              <div key={member.id} className="bg-card rounded-xl p-6 shadow-lg border border-border" data-testid={`card-member-${member.id}`}>
                <div className="flex gap-4">
                  {member.photoUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover"
                        data-testid={`img-member-${member.id}`}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold felicity-primary mb-2" data-testid={`text-member-name-${member.id}`}>
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mb-1" data-testid={`text-member-position-${member.id}`}>
                      {member.title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3" data-testid={`text-member-company-${member.id}`}>
                      {member.company}
                    </p>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-member-bio-${member.id}`}>
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
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