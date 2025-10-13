import { useTranslation } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import { FileText } from "lucide-react";

interface ManagementMessageProps {
  language: Language;
}

export function ManagementMessage({ language }: ManagementMessageProps) {
  const t = useTranslation(language);

  return (
    <section id="management-message" className="relative py-20 bg-background z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="felicity-bg w-16 h-16 rounded-lg flex items-center justify-center">
              <FileText className="text-white h-8 w-8" />
            </div>
          </div>
          <h2 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-management-message-title">
            {t.managementMessage.title}
          </h2>
        </div>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <p className="leading-relaxed text-muted-foreground" data-testid="text-management-message-p1">
            {t.managementMessage.paragraph1}
          </p>

          <p className="leading-relaxed text-muted-foreground" data-testid="text-management-message-p2">
            {t.managementMessage.paragraph2}
          </p>

          <p className="leading-relaxed text-muted-foreground" data-testid="text-management-message-p3">
            {t.managementMessage.paragraph3}
          </p>

          <p className="leading-relaxed text-muted-foreground" data-testid="text-management-message-p4">
            {t.managementMessage.paragraph4}
          </p>

          <p className="leading-relaxed text-muted-foreground" data-testid="text-management-message-p5">
            {t.managementMessage.paragraph5}
          </p>

          <div className="pt-8 mt-8 border-t border-border">
            <p className="text-right text-muted-foreground" data-testid="text-management-message-date">
              {t.managementMessage.date}
            </p>
            <p className="text-right font-medium text-foreground mt-2" data-testid="text-management-message-companies">
              {t.managementMessage.companies}
            </p>
            <p className="text-right font-bold text-felicity-primary mt-1" data-testid="text-management-message-signature">
              {t.managementMessage.signature}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
