import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";
import { Phone, Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContactProps {
  language: Language;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function Contact({ language }: ContactProps) {
  const t = useTranslation(language);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    investorType: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const investorTypes = [
    { value: "institutional", label: language === 'jp' ? "機関投資家" : "Institutional Investor" },
    { value: "private-wealth", label: language === 'jp' ? "プライベートウェルス / HNWI" : "Private Wealth / HNW" },
    { value: "corporate", label: language === 'jp' ? "事業会社" : "Corporate / Strategic" },
    { value: "other", label: language === 'jp' ? "その他" : "Other" }
  ];

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = language === 'jp'
        ? "お名前は2文字以上入力してください。"
        : "Name must be at least 2 characters.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = language === 'jp'
        ? "有効なメールアドレスを入力してください。"
        : "Please enter a valid email address.";
    }
    if (!formData.message || formData.message.trim().length < 10) {
      newErrors.message = language === 'jp'
        ? "メッセージは10文字以上入力してください。"
        : "Message must be at least 10 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || data.name;
      const lastName = nameParts.slice(1).join(" ") || "-";
      const payload = {
        firstName,
        lastName,
        email: data.email,
        company: data.investorType || undefined,
        message: data.message,
      };
      const response = await apiRequest("POST", "/api/contact", payload);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: language === 'jp' ? "エラー" : "Error",
        description: language === 'jp'
          ? "送信に失敗しました。もう一度お試しください。"
          : "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (validate()) {
      submitMutation.mutate(formData);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold felicity-primary mb-4" data-testid="text-contact-title">
            {t.contact.title}
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-contact-subtitle">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{language === 'jp' ? 'お問い合わせフォーム' : 'Contact Form'}</CardTitle>
                  <CardDescription>
                    {language === 'jp'
                      ? '以下のフォームにご記入ください。担当者より折り返しご連絡いたします。'
                      : 'Fill out the form below and our team will get back to you.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div
                      className="rounded-lg p-6 text-white text-center"
                      style={{ backgroundColor: "#2e7d32" }}
                      data-testid="contact-success-message"
                    >
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-90" />
                      <h3 className="text-xl font-semibold mb-2">
                        {language === 'jp' ? 'お問い合わせありがとうございます' : 'Thank You for Reaching Out!'}
                      </h3>
                      <p className="text-sm opacity-90">
                        {language === 'jp'
                          ? '2営業日以内にチームメンバーよりご連絡いたします。'
                          : 'A member of our team will be in touch with you within 2 business days.'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="name">
                            {language === 'jp' ? 'お名前' : 'Name'} *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder={language === 'jp' ? 'お名前を入力' : 'Your name'}
                            className={errors.name ? "border-red-500" : ""}
                            data-testid="input-contact-name"
                          />
                          {errors.name && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-contact-name">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="email">
                            {language === 'jp' ? 'メールアドレス' : 'Email'} *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            placeholder="your@email.com"
                            className={errors.email ? "border-red-500" : ""}
                            data-testid="input-contact-email"
                          />
                          {errors.email && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-contact-email">{errors.email}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="investorType">
                            {language === 'jp' ? '投資家タイプ（任意）' : 'Investor Type (Optional)'}
                          </Label>
                          <Select
                            value={formData.investorType}
                            onValueChange={(value) => setFormData({ ...formData, investorType: value })}
                          >
                            <SelectTrigger data-testid="select-investor-type">
                              <SelectValue placeholder={language === 'jp' ? '選択してください' : 'Select type'} />
                            </SelectTrigger>
                            <SelectContent>
                              {investorTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="message">
                            {language === 'jp' ? 'メッセージ' : 'Message'} *
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => {
                              setFormData({ ...formData, message: e.target.value });
                              if (errors.message) setErrors({ ...errors, message: undefined });
                            }}
                            placeholder={language === 'jp' ? 'お問い合わせ内容をご記入ください' : 'How can we help you?'}
                            rows={5}
                            className={errors.message ? "border-red-500" : ""}
                            data-testid="textarea-contact-message"
                          />
                          {errors.message && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-contact-message">{errors.message}</p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={submitMutation.isPending}
                        data-testid="button-submit-contact"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {language === 'jp' ? '送信中...' : 'Sending...'}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {language === 'jp' ? '送信する' : 'Send Message'}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        {language === 'jp'
                          ? '通常2営業日以内にご返信いたします。'
                          : 'We typically respond within 2 business days.'}
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <div data-testid="card-singapore-office">
                <h4 className="text-xl font-bold felicity-primary mb-4">{t.contact.singapore}</h4>
                <div className="space-y-3">
                  <p className="text-muted-foreground" data-testid="text-singapore-office-address">
                    6 Temasek Boulevard #29-04<br />
                    Suntec Tower Four<br />
                    Singapore 038986
                  </p>
                  <div className="flex items-center">
                    <Phone className="felicity-primary mr-3 h-4 w-4" />
                    <span data-testid="text-singapore-office-phone">+65-6890-0730</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="felicity-primary mr-3 h-4 w-4" />
                    <span data-testid="text-singapore-office-email">info@fgcsg.com</span>
                  </div>
                </div>
              </div>

              <div data-testid="card-tokyo-office">
                <h4 className="text-xl font-bold felicity-primary mb-4">{t.contact.tokyo}</h4>
                <div className="space-y-3">
                  <p className="text-muted-foreground" data-testid="text-tokyo-office-address">
                    6th Floor, Nagatacho Glassgate<br />
                    2-16-9 Hirakawacho, Chiyoda-ku<br />
                    Tokyo, Japan
                  </p>
                  <div className="flex items-center">
                    <Phone className="felicity-primary mr-3 h-4 w-4" />
                    <span data-testid="text-tokyo-office-phone">+81-3-5357-1025</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-6" data-testid="card-business-hours">
                <h5 className="font-semibold felicity-primary mb-2">{t.contact.businessHours}</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-business-hours">
                  {t.contact.businessHoursTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
