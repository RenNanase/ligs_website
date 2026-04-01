"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

const FEEDBACK_SUBJECTS = [
  { value: "general", labelKey: "feedback.subject.general" },
  { value: "technical", labelKey: "feedback.subject.technical" },
  { value: "feedback", labelKey: "feedback.subject.feedback" },
  { value: "complaint", labelKey: "feedback.subject.complaint" },
  { value: "other", labelKey: "feedback.subject.other" },
] as const

const MESSAGE_MAX = 500

function createSchema(t: (k: string) => string) {
  return z.object({
    name: z
      .string()
      .min(2, t("feedback.validation.nameMin"))
      .max(100)
      .regex(/^[\p{L}\p{N}\s\-']+$/u, t("feedback.validation.nameFormat")),
    phone: z
      .string()
      .min(1, t("feedback.validation.phoneRequired"))
      .refine(
        (s) => {
          const digits = s.replace(/\D/g, "")
          return /^(0|60)?1[0-9]\d{6,9}$/.test(digits)
        },
        t("feedback.validation.phoneFormat")
      ),
    email: z.string().email(t("feedback.validation.emailFormat")),
    subject: z.string().min(1, t("feedback.validation.subjectRequired")),
  subjectOther: z.string().optional(),
    message: z
      .string()
    .min(10, t("feedback.validation.messageMin"))
    .max(MESSAGE_MAX, t("feedback.validation.messageMax")),
  }).superRefine((data, ctx) => {
    if (data.subject === "other" && (!data.subjectOther || data.subjectOther.trim().length < 2)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("feedback.validation.subjectOtherRequired"), path: ["subjectOther"] })
    }
  })
}

export function FeedbackForm() {
  const { t } = useLanguage()
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [submitError, setSubmitError] = useState<string>("")

  const schema = useMemo(() => createSchema(t), [t])
  type FeedbackFormValues = z.infer<typeof schema>

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "",
      subjectOther: "",
      message: "",
    },
  })

  const messageLength = form.watch("message")?.length ?? 0

  const onSubmit = async (data: FeedbackFormValues) => {
    setSubmitStatus("loading")
    setSubmitError("")

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          subject:
            data.subject === "other" && data.subjectOther?.trim()
              ? data.subjectOther.trim()
              : t(FEEDBACK_SUBJECTS.find((s) => s.value === data.subject)?.labelKey ?? "feedback.subject.other") as string,
          message: data.message,
        }),
      })

      const json = (await res.json()) as { error?: string; retryAfter?: number }

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to submit")
      }

      setSubmitStatus("success")
      form.reset()
    } catch (err) {
      setSubmitStatus("error")
      setSubmitError(err instanceof Error ? err.message : t("feedback.errorGeneric"))
    }
  }

  if (submitStatus === "success") {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/30"
        role="alert"
      >
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" aria-hidden />
        <h3 className="font-heading text-xl font-semibold text-green-800 dark:text-green-300">
          {t("feedback.successTitle")}
        </h3>
        <p className="max-w-md text-green-700 dark:text-green-400">
          {t("feedback.successMessage")}
        </p>
        <Button
          variant="outline"
          onClick={() => setSubmitStatus("idle")}
          className="mt-2"
        >
          {t("feedback.submitAnother")}
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {submitStatus === "error" && (
          <div
            className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <p>{submitError}</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("feedback.name")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("feedback.namePlaceholder")}
                    aria-required="true"
                    autoComplete="name"
                    disabled={submitStatus === "loading"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("feedback.phone")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder={t("feedback.phonePlaceholder")}
                    aria-required="true"
                    autoComplete="tel"
                    disabled={submitStatus === "loading"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("feedback.email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={t("feedback.emailPlaceholder")}
                  aria-required="true"
                  autoComplete="email"
                  disabled={submitStatus === "loading"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("feedback.subject")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitStatus === "loading"}
              >
                <FormControl>
                  <SelectTrigger aria-required="true">
                    <SelectValue placeholder={t("feedback.subjectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FEEDBACK_SUBJECTS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.value === "other" && (
                <FormField
                  control={form.control}
                  name="subjectOther"
                  render={({ field: otherField }) => (
                    <FormItem>
                      <FormLabel>{t("feedback.subjectOther")}</FormLabel>
                      <FormControl>
                        <Input
                          {...otherField}
                          placeholder={t("feedback.subjectOtherPlaceholder")}
                          disabled={submitStatus === "loading"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("feedback.message")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("feedback.messagePlaceholder")}
                  rows={5}
                  aria-required="true"
                  maxLength={MESSAGE_MAX}
                  aria-describedby="message-counter"
                  disabled={submitStatus === "loading"}
                  className="resize-y min-h-[120px]"
                />
              </FormControl>
              <div
                id="message-counter"
                className="text-right text-sm text-muted-foreground"
                aria-live="polite"
              >
                {messageLength} / {MESSAGE_MAX}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full sm:w-auto min-w-[160px]"
          disabled={submitStatus === "loading"}
        >
          {submitStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              {t("feedback.submitting")}
            </>
          ) : (
            t("feedback.submit")
          )}
        </Button>
      </form>
    </Form>
  )
}
