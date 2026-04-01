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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

const JANTINA_OPTIONS = ["LELAKI", "PEREMPUAN"] as const
const TAHUN_KHIDMAT_OPTIONS = [
  "Kurang 3 tahun",
  "3 tahun hingga 5 tahun",
  "5 tahun hingga 10 tahun",
  "10 tahun hingga 15 tahun",
  "15 tahun dan ke atas",
] as const
const RESPONSE_OPTIONS = ["Bersetuju", "Tidak Bersetuju"] as const

const SURVEY_QUESTIONS = [
  "Halatuju LIGS jelas",
  "Pelaksanaan MS ISO 9001:2015 telah memberi impak yang positif kepada tugasan seharian saya",
  "Saya merasa gembira bekerja di dalam organisasi ini",
  "Pekerjaan saya sekarang memberi peluang untuk membangunkan kerjaya",
  "Semangat kerjasama dikalangan kakitangan adalah baik",
  "Pegawai atasan saya sentiasa membimbing dalam melaksanakan kerja",
  "Kursus-kursus yang dianjurkan oleh ibu pejabat dapat digunapakai dalam menjalankan tugasan harian",
  "Pegawai Atasan profesional dalam menilai hasil kerja kakitangan di bawah jagaannya",
] as const

function createSchema(t: (k: string) => string) {
  return z.object({
    jantina: z.enum(JANTINA_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    daerah: z.string().min(1, t("kepuasan.validation.daerahRequired")).max(255),
    bahagianUnit: z.string().min(1, t("kepuasanStaf.validation.bahagianRequired")).max(255),
    tahunKhidmat: z.enum(TAHUN_KHIDMAT_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q1: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q2: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q3: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q4: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q5: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q6: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q7: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    q8: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    cadanganKomen: z
      .string()
      .min(1, t("kepuasan.validation.cadanganRequired"))
      .max(2000),
  })
}

export function KepuasanStafForm() {
  const { t } = useLanguage()
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [submitError, setSubmitError] = useState<string>("")

  const schema = useMemo(() => createSchema(t), [t])
  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      jantina: undefined,
      daerah: "",
      bahagianUnit: "",
      tahunKhidmat: undefined,
      q1: undefined,
      q2: undefined,
      q3: undefined,
      q4: undefined,
      q5: undefined,
      q6: undefined,
      q7: undefined,
      q8: undefined,
      cadanganKomen: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setSubmitStatus("loading")
    setSubmitError("")

    try {
      const res = await fetch("/api/kepuasan-staf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = (await res.json()) as { error?: string; retryAfter?: number }

      if (!res.ok) {
        throw new Error(json.error ?? t("kepuasan.errorGeneric"))
      }

      setSubmitStatus("success")
      form.reset()
    } catch (err) {
      setSubmitStatus("error")
      setSubmitError(
        err instanceof Error ? err.message : t("kepuasan.errorGeneric")
      )
    }
  }

  if (submitStatus === "success") {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/30"
        role="alert"
      >
        <CheckCircle2
          className="h-14 w-14 text-green-600 dark:text-green-400"
          aria-hidden
        />
        <h3 className="font-heading text-xl font-semibold text-green-800 dark:text-green-300">
          {t("kepuasanStaf.successTitle")}
        </h3>
        <p className="max-w-md text-green-700 dark:text-green-400">
          {t("kepuasanStaf.successMessage")}
        </p>
        <Button
          variant="outline"
          onClick={() => setSubmitStatus("idle")}
          className="mt-2"
        >
          {t("kepuasan.submitAnother")}
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          const firstKey = Object.keys(errors)[0] as keyof FormValues
          if (firstKey) form.setFocus(firstKey)
        })}
        className="space-y-6"
        noValidate
      >
        {Object.keys(form.formState.errors).length > 0 && form.formState.isSubmitted && (
          <div
            className="flex items-center gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <p>{t("kepuasan.validation.completeAll")}</p>
          </div>
        )}
        {submitStatus === "error" && (
          <div
            className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <p>{submitError}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="jantina"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasan.jantina")} *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
                  disabled={submitStatus === "loading"}
                >
                  {JANTINA_OPTIONS.map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`jantina-${opt}`} />
                      <Label htmlFor={`jantina-${opt}`} className="cursor-pointer">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="daerah"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasan.daerah")} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("kepuasan.daerahPlaceholder")}
                  aria-required="true"
                  disabled={submitStatus === "loading"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bahagianUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasanStaf.bahagianUnit")} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("kepuasanStaf.bahagianUnitPlaceholder")}
                  aria-required="true"
                  disabled={submitStatus === "loading"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tahunKhidmat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasanStaf.tahunKhidmat")} *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitStatus === "loading"}
              >
                <FormControl>
                  <SelectTrigger aria-required="true">
                    <SelectValue placeholder={t("kepuasanStaf.tahunKhidmatPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TAHUN_KHIDMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {SURVEY_QUESTIONS.map((question, idx) => {
          const qKey = `q${idx + 1}` as
            | "q1"
            | "q2"
            | "q3"
            | "q4"
            | "q5"
            | "q6"
            | "q7"
            | "q8"
          return (
            <FormField
              key={qKey}
              control={form.control}
              name={qKey}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {idx + 1}. {question} *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                      disabled={submitStatus === "loading"}
                    >
                      {RESPONSE_OPTIONS.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={opt}
                            id={`${qKey}-${opt}`}
                          />
                          <Label
                            htmlFor={`${qKey}-${opt}`}
                            className="cursor-pointer"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        })}

        <FormField
          control={form.control}
          name="cadanganKomen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasan.cadanganKomen")} *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("kepuasan.cadanganPlaceholder")}
                  rows={4}
                  aria-required="true"
                  disabled={submitStatus === "loading"}
                  className="min-h-[100px] resize-y"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full min-w-[160px] sm:w-auto"
          disabled={submitStatus === "loading"}
        >
          {submitStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              {t("kepuasan.submitting")}
            </>
          ) : (
            t("kepuasan.submit")
          )}
        </Button>
      </form>
    </Form>
  )
}
