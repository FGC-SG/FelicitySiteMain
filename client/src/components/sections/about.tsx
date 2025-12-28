import { useTranslation, type Language } from "@/lib/i18n";
import modernBoardroomImage from "@assets/generated_images/modern_empty_singapore_boardroom.png";

interface AboutProps {
  language: Language;
}

export function About({ language }: AboutProps) {
  const t = useTranslation(language);

  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Modern corporate boardroom in Singapore */}
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
      </div>
    </section>
  );
}
