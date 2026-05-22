# SOLIQ ENERGY Web Revamp Implementation Plan

Date: 2026-05-22
Workspace: `/Users/namdo/Documents/learning/solar-web-revamp`

## Goal

Build a new SOLIQ ENERGY website inspired by the business flow of `cocosolar.vn`, but with a different UI direction based on the exported Stitch concepts. The target is a production-ready web app that can deploy to Cloudflare, has strong SEO, and uses Neon Postgres free tier for data.

Do not clone CoCo Solar branding or visuals. Use CoCo Solar only as a feature/reference benchmark.

## Brand Inputs

Current site: `https://www.soliq.com.vn/`

Brand name:
- `SOLIQ ENERGY`

Tagline from logo:
- `SMART POWER FROM SUN`

Current meta:
- Title: `SOLIQ ENERGY`
- Description: `Sử dụng điện thông minh.`

Logo assets discovered from current site:
- Main logo: `https://w.ladicdn.com/s1050x550/64a93ac33a94d40012d8b168/logo-chot-multi-design-6-20251024165831-xkhio.png`
- Icon / OG / favicon: `https://static.ladipage.net/64a93ac33a94d40012d8b168/mat-troi-png001-20251027113359-gxbck.png`

Contact details from current site:
- Email: `lienhe@soliq.com.vn`
- Hotline: `090.22.11.893 - 0902.262.101`
- Facebook: `https://www.facebook.com/soliqvn`
- Zalo: `https://zalo.me/0902211893`
- Messenger: `https://m.me/829928056870811`

## Reference Analysis

### CoCo Solar Feature Reference

Site studied: `https://cocosolar.vn/`

Important features to implement in SOLIQ's own way:
- Landing page with strong solar installation value proposition.
- Quote/calculator flow as the primary conversion feature.
- Payment modes: direct purchase, installment/deferred payment, and possibly rental/lease.
- Province/district/ward/address input.
- Average monthly electricity bill input.
- Daytime usage rate input.
- Battery/storage option.
- Solar quote result:
  - recommended capacity
  - estimated investment
  - annual production
  - monthly/yearly savings
  - payback period
  - IRR or investment return
  - installment plan options
- Lead capture before detailed quote/PDF:
  - full name
  - phone/Zalo
  - email
  - address
- SEO routes:
  - service pages
  - FAQ
  - news/articles
  - contact
  - partner/installer page
- Schema/SEO:
  - `LocalBusiness`
  - `Service`
  - `FAQPage`
  - `Article`
  - `BreadcrumbList`
  - canonical URLs
  - OG/Twitter metadata
  - sitemap and robots

### Existing SOLIQ Site Reference

Current SOLIQ site appears to be LadiPage-based. It has useful brand assets and contact information, but the current implementation is not suitable as the new technical foundation because:
- layout is generated/absolute-positioned
- SEO is basic
- no real quote engine
- not structured as a maintainable app

Use current site for brand continuity only.

### Stitch Design Reference

Local export folder:
- `/Users/namdo/Documents/stitch_cocosolar_futuristic_landing_page_v1`

The export contains screenshot-only concepts, not code.

Best visual references:
- Desktop hero direction:
  - `/Users/namdo/Documents/stitch_cocosolar_futuristic_landing_page_v1/cocosolar_futuristic_landing_page_v3/screen.png`
- Mobile landing direction:
  - `/Users/namdo/Documents/stitch_cocosolar_futuristic_landing_page_v1/cocosolar_mobile_landing_1/screen.png`
- Dashboard/calculator direction:
  - `/Users/namdo/Documents/stitch_cocosolar_futuristic_landing_page_v1/cocosolar_user_dashboard_1/screen.png`
- Contact form mood:
  - `/Users/namdo/Documents/stitch_cocosolar_futuristic_landing_page_v1/cocosolar_contact_inquiry_form_1/screen.png`

What to keep from Stitch:
- clean futuristic solar-tech mood
- light background, cyan/yellow glow, controlled glassmorphism
- frosted cards/panels
- dashboard-style energy metrics
- mobile bottom navigation style for app/dashboard surfaces

What to change:
- Replace all `cocosolar.vn` text and fake logos with `SOLIQ ENERGY`.
- Remove AI-generated nonsense copy such as "quantum storage" and broken mobile text.
- Reduce excessive blur/glow for readability and SEO pages.
- Use real SOLIQ logo and solar imagery.
- Add real quote calculator; Stitch hero does not include the core conversion flow.

Target design direction:
- `SOLIQ futuristic solar-finance`
- premium but practical
- clean, bright, technical, trustworthy
- glassmorphism as accent, not every section
- visible calculator/quote module above the fold

## Recommended Tech Stack

Framework:
- Next.js App Router
- TypeScript
- Tailwind CSS

Deployment:
- Cloudflare Workers with OpenNext adapter for full-stack Next.js.
- Avoid static-only architecture because the app needs lead capture, quote persistence, admin/CMS, and DB access.

Database:
- Neon Postgres free tier for MVP.
- Connection string: `postgresql://neondb_owner:npg_JqZvPSn0Qk4T@ep-lucky-art-aqm7tzh0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

DB access:
- Preferred: Cloudflare Hyperdrive + `pg` for Workers-friendly connection pooling.
- Alternative: `@neondatabase/serverless` if Hyperdrive setup is not wanted initially.

ORM:
- Drizzle ORM
- SQL migrations committed to repo

UI/helpers:
- Use local components, Tailwind tokens, and lucide icons where useful.
- Avoid importing a heavy UI kit unless the project really needs it.

Analytics:
- Keep support for Google Tag Manager / Meta Pixel env-driven, but do not hardcode old CoCo IDs.

## Initial Site Map

Public pages:
- `/`
- `/bao-gia-dien-mat-troi`
- `/lap-dat-dien-mat-troi-gia-dinh`
- `/dien-mat-troi-doanh-nghiep`
- `/he-thong-hybrid-luu-tru`
- `/thue-he-thong-dien-mat-troi`
- `/vat-tu-dien-mat-troi`
- `/du-an`
- `/tin-tuc`
- `/tin-tuc/[slug]`
- `/cau-hoi-thuong-gap`
- `/ve-soliq`
- `/lien-he`

App/admin pages:
- `/quote/[id]`
- `/admin`
- `/admin/leads`
- `/admin/quotes`
- `/admin/articles`
- `/admin/settings`

Optional later:
- `/dashboard` for customer energy monitoring mock/MVP
- `/doi-tac-thi-cong`

## Core User Flows

### Quote Flow MVP

1. User lands on homepage.
2. User enters quote inputs in hero calculator:
   - location
   - address detail
   - monthly electricity bill
   - daytime usage rate
   - customer type: residential/business/factory
   - payment mode
   - battery/storage option
3. App calculates recommended package.
4. App shows preview result:
   - capacity
   - estimated investment range
   - estimated monthly savings
   - payback period
5. To view/save detailed quote, user submits:
   - full name
   - phone
   - email optional
6. Save lead and quote to Neon.
7. Show detail page and contact CTA.

### Admin Flow MVP

1. Admin logs in with simple password/session.
2. Admin views leads and quote requests.
3. Admin updates lead status.
4. Admin edits calculation assumptions in settings.
5. Admin creates SEO articles.

## Calculation Model MVP

Inputs:
- `monthlyBillVnd`
- `daytimeUsageRate`
- `customerType`
- `roofAreaSqm` optional
- `province`
- `batteryOption`
- `paymentMode`

Assumptions stored in DB/settings:
- average monthly kWh estimate from bill
- EVN price per kWh
- kWp production per year by region
- system price per kWp
- battery/storage price
- performance degradation
- annual electricity price increase
- operation/maintenance percentage
- VAT
- installment setup fee
- installment term options

Outputs:
- recommended capacity kWp
- estimated annual production kWh
- self-consumed energy
- annual savings
- total investment before/after VAT
- payback period
- rough IRR
- installment monthly payment options

Important:
- The result should show "estimated" language.
- Do not pretend the calculation is a final technical design.
- Include a disclaimer that an onsite survey is required for exact capacity and structure safety.

## Database Draft

Tables:

`leads`
- `id`
- `name`
- `phone`
- `email`
- `address`
- `province`
- `district`
- `ward`
- `source`
- `status`
- `note`
- `created_at`
- `updated_at`

`quote_requests`
- `id`
- `lead_id`
- `payment_mode`
- `customer_type`
- `monthly_bill_vnd`
- `daytime_usage_rate`
- `roof_area_sqm`
- `battery_option`
- `location_json`
- `input_json`
- `created_at`

`quote_results`
- `id`
- `quote_request_id`
- `recommended_capacity_kwp`
- `estimated_investment_vnd`
- `annual_production_kwh`
- `annual_savings_vnd`
- `payback_years`
- `irr_percent`
- `installment_plans_json`
- `result_json`
- `created_at`

`articles`
- `id`
- `slug`
- `title`
- `description`
- `content`
- `category`
- `cover_image`
- `published`
- `published_at`
- `seo_json`
- `created_at`
- `updated_at`

`partners`
- `id`
- `name`
- `logo`
- `type`
- `url`
- `sort_order`
- `active`

`projects`
- `id`
- `title`
- `slug`
- `location`
- `capacity_kwp`
- `customer_type`
- `cover_image`
- `content`
- `metrics_json`
- `published`

`settings`
- `key`
- `value_json`
- `updated_at`

`audit_events`
- `id`
- `actor`
- `entity_type`
- `entity_id`
- `event`
- `payload_json`
- `created_at`

## SEO Plan

Base:
- Every public page has unique metadata.
- Use canonical URLs.
- Use semantic headings.
- Render SEO content server-side.
- Do not hide critical text inside images.
- Generate `sitemap.xml` and `robots.txt`.

Schema:
- Home: `LocalBusiness`, `Organization`, `WebSite`.
- Service pages: `Service`.
- FAQ page and FAQ sections: `FAQPage`.
- Article detail: `Article`, `BreadcrumbList`.
- Contact page: `LocalBusiness` with phone/email/address.

Keyword clusters:
- `lắp điện mặt trời`
- `điện mặt trời gia đình`
- `điện mặt trời doanh nghiệp`
- `lắp điện mặt trời trả góp`
- `chi phí lắp điện mặt trời`
- `hệ thống điện mặt trời hybrid`
- `bộ lưu điện năng lượng mặt trời`
- `điện mặt trời mái nhà`

Performance:
- Optimize hero image and logo assets.
- Lazy-load non-critical charts and dashboard preview.
- Avoid excessive client JS on content pages.
- Use static generation where possible for articles.
- Cache public content aggressively.

## Design System Draft

Brand colors sampled conceptually from SOLIQ + Stitch:
- Deep green: `#255d2b`
- Solar orange: `#ff8a00`
- Clean cyan: `#35c7e8`
- Soft blue: `#dff4ff`
- Pale yellow: `#fff3a6`
- Text dark: `#17202a`
- Muted text: `#5c6b73`
- Surface: `rgba(255,255,255,0.72)`
- Border: `rgba(255,255,255,0.7)`

Typography:
- Use a modern sans family with Vietnamese support.
- Candidate: Inter, Be Vietnam Pro, or system sans.
- Avoid overly condensed hero fonts from Stitch if Vietnamese copy gets cramped.

Component motifs:
- Frosted nav bar.
- Quote calculator panel.
- Metric cards.
- Solar dashboard preview.
- Clean service cards.
- CTA strips with real contact actions.
- Minimal icon treatment.

Glassmorphism rules:
- Use it in hero, calculator, metrics, and dashboard preview.
- Do not make every section a floating card.
- Keep contrast high enough for mobile readability.
- Reduce glow on long content pages.

## First Implementation Phase

1. Scaffold Next.js App Router app.
2. Add TypeScript, Tailwind, ESLint.
3. Add Cloudflare/OpenNext deployment setup.
4. Add Drizzle + Neon/Hyperdrive environment shape.
5. Create layout, global styles, design tokens.
6. Add SOLIQ logo assets from current site into `public/brand`.
7. Build homepage:
   - header
   - hero with SOLIQ brand
   - quote calculator MVP
   - solution cards
   - dashboard preview
   - benefits
   - process
   - FAQ
   - contact CTA
8. Build quote API/server action and local calculation service.
9. Save leads/quotes to DB.
10. Add SEO metadata and JSON-LD for homepage.
11. Verify locally in browser desktop/mobile.
12. Run build.
13. Deploy preview to Cloudflare.

## Implementation Notes

- Keep code modular from day one:
  - `components/marketing`
  - `components/quote`
  - `components/admin`
  - `lib/db`
  - `lib/quote`
  - `lib/seo`
  - `content`
- Do not rely on screenshots as UI assets except for design reference.
- Use real text, semantic HTML, and native form controls.
- Replace all CoCo/Stitch placeholder names with SOLIQ.
- Keep the first screen useful: calculator and CTA should be visible without scrolling on desktop.
- On mobile, use a step-by-step quote flow instead of a dense desktop form.
- Treat admin as internal MVP, not a polished public dashboard initially.

## Company Info (from soliq.com.vn)

Address:
- `125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội`

## Price Tables (from soliq.com.vn — seed into settings table)

### Hòa lưới (Grid-tied)

| Công suất | Số tấm pin | Inverter | Giá (VNĐ) |
|-----------|-----------|----------|-----------|
| 5kWp | 10 tấm | 5kW | 47.300.000 |
| 8kWp | 14 tấm | 6kW | 56.000.000 |
| 10kWp | 18 tấm | 10kW | 78.000.000 |
| 12kWp | 20 tấm | 10kW | 84.300.000 |
| 15kWp | 26 tấm | 15kW | 106.500.000 |
| 18kWp | 30 tấm | 18kW | 119.000.000 |
| 20kWp | 34 tấm | 20kW | 130.800.000 |
| 25kWp | 38 tấm | 20kW | 143.000.000 |

### Hybrid (with battery storage)

| Công suất | Số tấm | Inverter | Pin lưu | Giá (VNĐ) |
|-----------|--------|----------|---------|-----------|
| 5kWp | 9 tấm | 5kW | 51.2V/100AH | 51.000.000 |
| 8kWp | 14 tấm | 8kW | 51.2V/100AH | 85.000.000 |
| 8kWp 3 pha | 14 tấm | 8kW 3P | 51.2V/100AH | 100.500.000 |
| 10kWp 3 pha | 18 tấm | 10kW 3P | 51.2V/100AH | 132.000.000 |
| 15kWp 3 pha | 28 tấm | 15kW 3P | 51.2V/100AH | 156.000.000 |
| 20kWp 3 pha | 36 tấm | 20kW 3P | 51.2V/100AH | 197.000.000 |

Note: Giá trên chỉ mang tính tham khảo. Cần khảo sát thực tế để có báo giá chính xác.

Derived price-per-kWp estimates (for calculator assumptions):
- Grid-tied: ~7.000.000 – 9.400.000 VNĐ/kWp (avg ~8.000.000)
- Hybrid: ~9.500.000 – 10.200.000 VNĐ/kWp (avg ~9.800.000)

## Open Questions For Implementation

- Whether SOLIQ wants "trả góp", "trả chậm", "thuê hệ thống", or all three as product lines.
- Whether to integrate Zalo/Messenger as direct links only or also send lead notifications.
- Whether admin login should be simple password auth for MVP or proper auth provider.

