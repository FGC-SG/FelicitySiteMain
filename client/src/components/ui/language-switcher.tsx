import { Button } from "@/components/ui/button";
import { type Language } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentLanguage === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onLanguageChange('en')}
        className={
          currentLanguage === 'en'
            ? 'felicity-bg text-primary-foreground felicity-border'
            : 'text-muted-foreground border-gray-300'
        }
        data-testid="button-lang-en"
      >
        EN
      </Button>
      <Button
        variant={currentLanguage === 'jp' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onLanguageChange('jp')}
        className={
          currentLanguage === 'jp'
            ? 'felicity-bg text-primary-foreground felicity-border'
            : 'text-muted-foreground border-gray-300'
        }
        data-testid="button-lang-jp"
      >
        JP
      </Button>
    </div>
  );
}
