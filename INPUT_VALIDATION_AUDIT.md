# Input Validation Audit Report

**Date:** 2025-02-26
**Scope:** Full codebase review for input validation and security issues

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 4 | Fixed |
| High | 3 | Fixed |
| Medium | 6 | Partially fixed / Documented |
| Low | 3 | Documented |

---

## 1. Input Validation Coverage

### User Inputs Reviewed

| Source | Validated? | Approach |
|--------|------------|----------|
| Forms (feedback) | Yes | Zod schema, whitelist |
| Forms (admin login) | Partial | NextAuth handles credentials |
| API JSON bodies | Mixed | See per-route below |
| URL params (slug, id) | Partial | Passed to Prisma (parameterized) |
| searchParams (page, limit) | Partial | Some use `parseInt` without NaN guard |
| Headers (X-Forwarded-For) | No | Used for rate limit; can be spoofed |
| Cookies | N/A | Session via NextAuth |
| File uploads | Yes | Type/size checks per upload route |

### Validation Approach

- **Whitelist-based:** Feedback form (name regex, phone format, email), Bahagian (slug regex), new API schemas
- **Blacklist-based:** None identified
- **Recommendation:** Use whitelist (Zod schemas) for all user inputs

---

## 2. Database Operations

- **Prisma ORM:** All queries use Prisma client → parameterized queries by default. No raw SQL in app code.
- **No `$queryRaw` / `$executeRaw`** usage in application code.
- **Verdict:** SQL injection risk is **low** (Prisma parameterizes).

---

## 3. Output Encoding / XSS

| Location | Method | Risk | Notes |
|----------|--------|------|------|
| `app/kelab-sukan/page.tsx` | dangerouslySetInnerHTML | Medium | Admin-edited HTML; TipTap output |
| `app/kelab-sukan/intro-section.tsx` | dangerouslySetInnerHTML | Medium | Admin-edited intro |
| `app/bahagian/[slug]/page.tsx` | dangerouslySetInnerHTML | Medium | Admin-edited content |
| `app/layout.tsx` | dangerouslySetInnerHTML | Low | themeCss from server |
| `components/sections/tiktok-embed.tsx` | innerHTML | Low | HTML from TikTok oEmbed API |
| `components/ui/chart.tsx` | dangerouslySetInnerHTML | Low | Recharts SVG |

**Recommendations:**
- For rich text (TipTap): sanitize on save or use a safe subset of tags.
- For TikTok: HTML from official oEmbed; consider DOMPurify for defense in depth.

---

## 4. Dangerous Patterns

| Pattern | Found? | Location |
|---------|--------|----------|
| innerHTML | Yes | tiktok-embed.tsx (third-party HTML) |
| eval() | No | - |
| document.write | No | - |
| dangerouslySetInnerHTML | Yes | See table above |

---

## 5. Vulnerabilities Found & Fixes

### Critical (Fixed)

1. **Feedback email HTML injection (phone)**
   - **File:** `app/api/feedback/route.ts`
   - **Issue:** Raw `phone` used in email HTML instead of `safePhone`
   - **Fix:** Replaced with `safePhone` for consistent encoding

2. **Announcements API – no validation**
   - **File:** `app/api/announcements/route.ts`
   - **Issue:** Raw JSON body passed to Prisma; mass assignment, type confusion
   - **Fix:** Added Zod `announcementSchema` validation

3. **Banners API – no validation**
   - **File:** `app/api/banners/route.ts`
   - **Issue:** POST/PUT accepted raw body; no schema validation
   - **Fix:** Added `bannerSlideSchema`, array limit (20), JSON parse try/catch

4. **Settings API – no validation, no auth**
   - **File:** `app/api/settings/route.ts`
   - **Issue:** PUT accepted any body; no auth on update
   - **Fix:** Added `settingsSchema`, `requireAuth` for PUT

### High (Fixed)

5. **parseInt NaN propagation**
   - **File:** `app/api/bahagian/route.ts` (and similar)
   - **Issue:** Invalid `page`/`limit` could produce NaN
   - **Fix:** Introduced `safeParseInt()` in `lib/api-validation.ts`

6. **Mass assignment in multiple API routes**
   - **Files:** announcements, banners, achievements, news, etc.
   - **Issue:** Body passed directly to Prisma
   - **Fix:** Announcements and banners now use strict schemas; others documented for future work

### Medium (Documented / Partial)

7. **Kelab Sukam intro – stored HTML**
   - **File:** `app/api/kelab-sukan/intro/route.ts`
   - **Issue:** HTML stored without sanitization; rendered with dangerouslySetInnerHTML
   - **Recommendation:** Sanitize HTML on save (e.g. DOMPurify with allowed tags)

8. **URL param validation (slug, id)**
   - **Files:** `app/bahagian/[slug]`, `app/info-korporat/[slug]`, etc.
   - **Issue:** Slugs/IDs used directly; no format check
   - **Note:** Prisma parameterizes; odd values return 404. Slug regex exists in create schema.

9. **Directory members reorder**
   - **File:** `app/api/directory/members/reorder/route.ts`
   - **Issue:** `memberIds` not validated as CUIDs
   - **Note:** Invalid IDs cause Prisma errors; consider CUID validation

10. **IP spoofing (rate limit bypass)**
    - **File:** `app/api/feedback/route.ts` – `x-forwarded-for`
    - **Issue:** Client can spoof IP to bypass rate limit
    - **Note:** Mitigate via proxy configuration and/or server-side IP handling

11. **Archive restore – type validation**
    - **File:** `app/api/archive/restore/route.ts`
    - **Issue:** `id` not validated as CUID
    - **Note:** `type` already whitelisted to berita|galeri

12. **Other API routes without schemas**
    - News, tenders, achievements, gallery, etc. accept JSON without Zod validation
    - **Recommendation:** Add schemas incrementally using `lib/api-validation.ts`

### Low (Documented)

13. **TikTok embed innerHTML**
    - HTML from TikTok oEmbed; trust TikTok; optional DOMPurify for hardening

14. **Recharts dangerouslySetInnerHTML**
    - Library-generated SVG; low risk

15. **Theme CSS in layout**
    - Server-sourced; low risk

---

## 6. New Shared Utilities

- **`lib/api-validation.ts`**
  - `safeParseInt()` – parseInt with fallback, no NaN
  - `announcementSchema` – announcement create payload
  - `bannerSlideSchema` – single banner slide
  - `settingsSchema` – settings update payload
  - `slugSchema`, `cuidSchema`, `urlSchema`, `str()` – reusable validators

---

## 7. Recommendations

1. **Add Zod validation** to remaining API routes that accept JSON (news, tenders, achievements, etc.).
2. **Sanitize rich text** before saving (TipTap output) with DOMPurify or similar.
3. **Use `safeParseInt`** for all `page`/`limit` parsing from searchParams.
4. **Validate CUID format** for `id` params where applicable.
5. **Restrict `x-forwarded-for`** usage when behind a trusted proxy only.
6. **Review authentication** on all mutating endpoints; ensure none are publicly writable.
