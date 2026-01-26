import { useState } from "react";
import { useTranslation, type Language } from "@/lib/i18n";
import { Phone, Mail, Send, CheckCircle } from "lucide-react";
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

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: language === 'jp' ? "送信完了" : "Message Sent",
        description: language === 'jp' 
          ? "お問い合わせありがとうございます。担当者より折り返しご連絡いたします。" 
          : "Thank you for your inquiry. Our team will contact you shortly.",
      });
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
    if (formData.name && formData.email && formData.message) {
      submitMutation.mutate(formData);
    }
  };

  const investorTypes = [
    { value: "institutional", label: language === 'jp' ? "機関投資家" : "Institutional Investor" },
    { value: "private-wealth", label: language === 'jp' ? "プライベートウェルス / HNWI" : "Private Wealth / HNW" },
    { value: "corporate", label: language === 'jp' ? "事業会社" : "Corporate / Strategic" },
    { value: "other", label: language === 'jp' ? "その他" : "Other" }
  ];

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
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        {language === 'jp' ? 'お問い合わせありがとうございます' : 'Thank You for Your Inquiry'}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === 'jp' 
                          ? '担当者より折り返しご連絡いたします。' 
                          : 'Our team will contact you shortly.'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {language === 'jp' ? 'お名前' : 'Name'} *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={language === 'jp' ? 'お名前を入力' : 'Your name'}
                            required
                            data-testid="input-contact-name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">
                            {language === 'jp' ? 'メールアドレス' : 'Email'} *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={language === 'jp' ? 'your@email.com' : 'your@email.com'}
                            required
                            data-testid="input-contact-email"
                          />
                        </div>

                        <div className="space-y-2">
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

                        <div className="space-y-2">
                          <Label htmlFor="message">
                            {language === 'jp' ? 'メッセージ' : 'Message'} *
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder={language === 'jp' ? 'お問い合わせ内容をご記入ください' : 'How can we help you?'}
                            rows={5}
                            required
                            data-testid="textarea-contact-message"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gap-2"
                        disabled={submitMutation.isPending}
                        data-testid="button-submit-contact"
                      >
                        <Send className="h-4 w-4" />
                        {submitMutation.isPending 
                          ? (language === 'jp' ? '送信中...' : 'Sending...') 
                          : (language === 'jp' ? '送信する' : 'Send Message')}
                      </Button>
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
