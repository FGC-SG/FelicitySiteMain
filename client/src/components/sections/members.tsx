import { useTranslation, type Language } from "@/lib/i18n";

interface MembersProps {
  language: Language;
}

export function Members({ language }: MembersProps) {
  const t = useTranslation(language);

  const members = [
    {
      name: "Tomohiro Fujita",
      position: t.members.positions.manager,
      company: "Felicity Global Capital Pte. Ltd.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: t.members.bios.fujita
    },
    {
      name: "Masaki Takano", 
      position: t.members.positions.seniorPrincipal,
      company: "Felicity Global Capital Pte. Ltd.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: t.members.bios.takano
    },
    {
      name: "Yuta Kaneda",
      position: t.members.positions.presidentCeo,
      company: "Felicity Capital Co., Ltd.",
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300", 
      bio: t.members.bios.kaneda
    },
    {
      name: "Ryo Shimada",
      position: t.members.positions.managingDirector,
      company: "Felicity Capital Co., Ltd.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: t.members.bios.shimada
    },
    {
      name: "Akira Chouhan",
      position: t.members.positions.managingPartner,
      company: "Felicity Capital Co., Ltd.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      bio: t.members.bios.chouhan
    }
  ];

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {members.map((member, index) => (
            <div key={index} className="bg-card rounded-xl p-6 shadow-lg border border-border text-center" data-testid={`card-member-${index}`}>
              <div className="mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
                  data-testid={`img-member-${index}`}
                />
                <h3 className="text-xl font-bold felicity-primary mb-2" data-testid={`text-member-name-${index}`}>
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground font-medium mb-1" data-testid={`text-member-position-${index}`}>
                  {member.position}
                </p>
                <p className="text-xs text-muted-foreground mb-4" data-testid={`text-member-company-${index}`}>
                  {member.company}
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-member-bio-${index}`}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}