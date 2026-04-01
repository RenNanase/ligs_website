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
const DAERAH_OPTIONS = [
  "Beaufort",
  "Beluran",
  "Kalabakan",
  "Keningau",
  "Kinabatangan",
  "Kota Belud",
  "Kota Kinabalu",
  "Kota Marudu",
  "Kuala Penyu",
  "Kudat",
  "Kunak",
  "Lahad Datu",
  "Nabawan",
  "Papar",
  "Penampang",
  "Pitas",
  "Putatan",
  "Ranau",
  "Sandakan",
  "Semporna",
  "Sipitang",
  "Tambunan",
  "Tawau",
  "Telupid",
  "Tenom",
  "Tongod",
  "Tuaran",
] as const
const PEKERJAAN_OPTIONS = [
  "Pekebun getah sepenuh masa",
  "Pekebun getah dan juga bekerja di sektor kerajaan",
  "Pekebun getah dan juga bekerja di sektor swasta",
] as const
const RESPONSE_OPTIONS = ["Bersetuju", "Tidak Bersetuju"] as const

const SURVEY_QUESTIONS = [
  "LIGS menjawab setiap pertanyaan lisan dengan penerangan yang difahami",
  "LIGS menjawab setiap surat saya yang saya hantar",
  "Kakitangan LIGS sangat membantu saya semasa berurusan",
  "Penyelesaian terhadap 'ADUAN' saya disampaikan kepada saya",
  "Kakitangan LIGS yang membeli getah memberi perkhidmatan dengan baik (cekap)",
  "Prosedur penyelenggaraan ladang dikomunikasikan kepada saya",
  "Tumbesaran pokok getah di ladang adalah baik",
  "Latihan yang penorehan yang dijalankan di ladang adalah baik",
  "Bibit getah berpolibeg yang dibekalkan oleh Unit Tapak Semaian berkeadaan baik",
] as const

function createSchema(t: (k: string) => string) {
  return z.object({
    jantina: z.enum(JANTINA_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    umur: z
      .string()
      .min(1, t("kepuasan.validation.umurRequired"))
      .regex(/^\d{1,2}$/, t("kepuasan.validation.umurFormat")),
    daerah: z.enum(DAERAH_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.daerahRequired") }),
    }),
    pekerjaan: z.enum(PEKERJAAN_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    tahunPerkhidmatan: z
      .string()
      .min(1, t("kepuasan.validation.tahunRequired"))
      .regex(/^\d{4}$/, t("kepuasan.validation.tahunFormat")),
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
    q9: z.enum(RESPONSE_OPTIONS, {
      errorMap: () => ({ message: t("kepuasan.validation.required") }),
    }),
    cadanganKomen: z
      .string()
      .min(1, t("kepuasan.validation.cadanganRequired"))
      .max(2000),
  })
}

export function KepuasanPelangganForm() {
  const { t } = useLanguage()
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [submitError, setSubmitError] = useState<string>("")
  const [validationMessage, setValidationMessage] = useState<string>("")

  const schema = useMemo(() => createSchema(t), [t])
  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched", // Validates on blur and submit; blocks submit when any field is invalid
    criteriaMode: "all",
    defaultValues: {
      jantina: undefined,
      umur: "",
      daerah: undefined,
      pekerjaan: undefined,
      tahunPerkhidmatan: "",
      q1: undefined,
      q2: undefined,
      q3: undefined,
      q4: undefined,
      q5: undefined,
      q6: undefined,
      q7: undefined,
      q8: undefined,
      q9: undefined,
      cadanganKomen: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setSubmitStatus("loading")
    setSubmitError("")

    try {
      const res = await fetch("/api/kepuasan-pelanggan", {
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
          {t("kepuasan.successTitle")}
        </h3>
        <p className="max-w-md text-green-700 dark:text-green-400">
          {t("kepuasan.successMessage")}
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
          name="umur"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasan.umur")} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("kepuasan.umurPlaceholder")}
                  inputMode="numeric"
                  maxLength={2}
                  pattern="[0-9]*"
                  aria-required="true"
                  disabled={submitStatus === "loading"}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 2)
                    field.onChange(v)
                  }}
                />
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
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitStatus === "loading"}
              >
                <FormControl>
                  <SelectTrigger aria-required="true">
                    <SelectValue placeholder={t("kepuasan.daerahPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DAERAH_OPTIONS.map((opt) => (
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

        <FormField
          control={form.control}
          name="pekerjaan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasan.pekerjaan")} *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitStatus === "loading"}
              >
                <FormControl>
                  <SelectTrigger aria-required="true">
                    <SelectValue placeholder={t("kepuasan.pekerjaanPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PEKERJAAN_OPTIONS.map((opt) => (
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

        <FormField
          control={form.control}
          name="tahunPerkhidmatan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("kepuasan.tahunPerkhidmatan")} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("kepuasan.tahunPlaceholder")}
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]*"
                  aria-required="true"
                  disabled={submitStatus === "loading"}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4)
                    field.onChange(v)
                  }}
                />
              </FormControl>
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
            | "q9"
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
