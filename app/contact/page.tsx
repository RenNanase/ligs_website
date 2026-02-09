"use client"

import React from "react"

import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const { language, t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 font-heading text-4xl font-bold text-primary-foreground md:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-xl border border-border bg-card p-8">
              {submitted ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 font-heading text-2xl font-semibold text-card-foreground">
                    {language === "en" ? "Message Sent!" : "Mesej Dihantar!"}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "Thank you for reaching out. We'll get back to you soon."
                      : "Terima kasih kerana menghubungi kami. Kami akan menghubungi anda segera."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <Label htmlFor="name" className="mb-2 block text-sm font-medium text-card-foreground">
                      {t("contact.name")}
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder={language === "en" ? "John Doe" : "Ahmad bin Ali"}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block text-sm font-medium text-card-foreground">
                      {t("contact.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="email@example.com"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="mb-2 block text-sm font-medium text-card-foreground">
                      {t("contact.subject")}
                    </Label>
                    <Input
                      id="subject"
                      required
                      placeholder={
                        language === "en"
                          ? "How can we help?"
                          : "Bagaimana kami boleh membantu?"
                      }
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="mb-2 block text-sm font-medium text-card-foreground">
                      {t("contact.message")}
                    </Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      placeholder={
                        language === "en"
                          ? "Tell us about your project..."
                          : "Ceritakan tentang projek anda..."
                      }
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-semibold"
                  >
                    <Send className="h-4 w-4" />
                    {t("contact.send")}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
                  {language === "en" ? "Get in Touch" : "Hubungi Kami"}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {language === "en"
                    ? "Have a question or want to work together? Fill out the form or reach us through the contact details below."
                    : "Ada soalan atau ingin bekerjasama? Isi borang atau hubungi kami melalui maklumat hubungan di bawah."}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: MapPin,
                    label: t("contact.address"),
                    value: "Level 12, Menara Corporate, Jalan Sultan Ismail, 50250 Kuala Lumpur, Malaysia",
                  },
                  {
                    icon: Phone,
                    label: t("contact.phone"),
                    value: "+60 3-1234 5678",
                  },
                  {
                    icon: Mail,
                    label: t("contact.email"),
                    value: "info@corpsite.com",
                  },
                  {
                    icon: Clock,
                    label: language === "en" ? "Business Hours" : "Waktu Perniagaan",
                    value:
                      language === "en"
                        ? "Mon - Fri: 9:00 AM - 6:00 PM"
                        : "Isn - Jum: 9:00 PG - 6:00 PTG",
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
