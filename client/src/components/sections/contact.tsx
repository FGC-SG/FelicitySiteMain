import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation, type Language } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { Phone } from "lucide-react";

interface ContactProps {
  language: Language;
}

export function Contact({ language }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const t = useTranslation(language);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      message: formData.get("message") as string,
    };

    try {
      await apiRequest("POST", "/api/contact", data);
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We will get back to you soon.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold felicity-primary mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-contact">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    {t.contact.form.firstName}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full"
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    {t.contact.form.lastName}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full"
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t.contact.form.email}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full"
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                  {t.contact.form.company}
                </Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  className="w-full"
                  data-testid="input-company"
                />
              </div>
              <div>
                <Label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  {t.contact.form.message}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full"
                  data-testid="textarea-message"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="felicity-bg text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                data-testid="button-submit-contact"
              >
                {isSubmitting ? "Sending..." : t.contact.form.send}
              </Button>
            </form>
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
                  <span data-testid="text-tokyo-office-phone">+81-3-5375-1025</span>
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
    </section>
  );
}
