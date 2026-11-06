# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Tech recruiters and HR** screening Site Reliability / DevOps candidates. They skim fast, often on a phone, and need role, recent employer, core stack and a way to get the résumé or make contact within seconds.
- **Engineering managers** judging technical depth: what infrastructure Reksy has actually run (Kubernetes on AWS and GCP, CI/CD pipelines, observability, cost and resource optimization) and at what scope.
- **Freelance clients** looking for someone to take on infrastructure or DevOps project work. A secondary audience: the same evidence serves them, but the site is not a services pitch.

## Product Purpose

The personal CV site of Petrus Chanel Reksy Arfila ("Reksy"), a DevOps and Site Reliability Engineer based in Jakarta, Indonesia, currently DevOps Engineer at MEMBER.ID. It exists to land a **full-time SRE / DevOps role**. Success means a recruiter or hiring manager understands his fit quickly, then downloads the résumé or sends a message.

## Positioning

Hands-on SRE experience across **both AWS and GCP**: Kubernetes (EKS, GKE), deployment pipelines (Jenkins, GitHub Actions), New Relic monitoring with SLA dashboards, cluster cost and resource tuning (taints, spot VMs, autoscaling), resource tagging automation and VPN operations. Earlier backend development (Laravel APIs) and IT support / networking roles ground him in hardware, networking and system administration below the cloud layer.

## Operating Context

- Visitors usually arrive from a job application, LinkedIn or a recruiter's link, and read on whatever device they have. Mobile matters as much as desktop.
- The site is a single page: About, Experience, Education, Organizations, Projects, Skills, Licenses & certifications, Contact.
- The full résumé is a separate document on Google Drive; the site is the overview, the résumé is the artifact recruiters forward.

## Capabilities and Constraints

- **Hosting:** static site on GitHub Pages (`Reksy747.github.io`). Plain HTML, CSS and vanilla JS, with no framework and no backend.
- **Build:** SCSS compiled with the `sass` command line tool (`npm run build:css`) into `css/`. `npm run build` assembles `dist/`, which GitHub Actions deploys to GitHub Pages.
- **Contact:** the form posts to Formspree (`https://formspree.io/f/xknagwwz`). Keep it.
- **Résumé:** download links to Google Drive. Keep it.
- **No third-party runtime dependencies** on the page (jQuery, Bootstrap and Font Awesome were removed for security). Keep it that way unless there's a clear need.
- **Experience source of truth:** Reksy's LinkedIn profile (`linkedin.com/in/reksy`). Experience was synced from it on 2026-11-04; the current role is DevOps Engineer at MEMBER.ID (Mar 2023 – present). Re-sync from LinkedIn rather than inventing or rewording claims.
## Brand Commitments

- Name shown as **Petrus Chanel Reksy Arfila**; short form **Reksy** (nav brand, LinkedIn handle `reksy`).
- Title: **Site Reliability Engineer**.
- Profile photo: `images/profile.png`.
- Social links: GitHub `Reksy747`, Stack Overflow, LinkedIn `in/reksy`, Facebook, X/Twitter `Raden_Reksy`.
- Content is in English.

## Evidence on Hand

- Work history, education, organizations and certifications as written in `cv.html`.
- Projects with screenshots: E-learning Dutatani (`images/project.png`, Laravel, `github.com/Reksy747/dutani`) and BloodCare (`images/project2.png`, Java, `github.com/Reksy747/BloodCare`).
- Unused images in the repo: `images/cicdproject.png`, `images/deploy.JPG`, `images/lead-bg.jpg`. These are not yet tied to a described project; ask before presenting them as one.
- **Absent, do not fabricate:** metrics or impact numbers (uptime, cost savings, deploy counts), testimonials, employer logos, newer roles, and SRE/infrastructure project write-ups. Ask Reksy for real figures before adding any.
- **Do not show:** GPA (removed from Education; keep it off).
- **Portfolio page (`portfolio.html`):** filled on 2026-11-04 from LinkedIn only (Experience + About). It has an Operating scope table, three case studies (Context / What I did / Why it matters) and a troubleshooting method, with no metrics, diagrams or real incident stories, because LinkedIn has none. When Reksy supplies them, add: uptime/SLA, cost savings, MTTR, deploy figures (as an Outcome row per case and a results table), architecture diagrams, and 1–2 real postmortems (the `.postmortem` and `.slot` styles still exist for this). Never invent figures.

## Product Principles

1. **Fit in seconds.** Role, recent employer, cloud stack and the résumé/contact actions must be clear without scrolling far, on a phone.
2. **Evidence over adjectives.** Concrete systems, tools and responsibilities persuade engineering managers; generic self-description does not.
3. **Honest and current.** Never invent experience, numbers or proof. Mark gaps for Reksy to fill instead.
4. **Fast, simple, dependency-free.** A reliability engineer's own site should load quickly, work without JS for its content, and carry no vulnerable libraries.

## Accessibility & Inclusion

No product-specific standard was set. The current build respects reduced-motion, reduced-transparency, increased-contrast and dark-mode preferences, and that floor should be kept.
