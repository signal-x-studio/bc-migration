# Feature Images Validation Report

**Generated:** 2025-12-21

## Summary

| Metric | Count |
|--------|-------|
| Total MDX Files | 179 |
| Files with featureImage | 113 |
| Files without featureImage | 66 |
| **Valid Images** | **91** |
| **Total Issues** | **88** |

### Breakdown by Type

#### Unsplash URLs
- Valid (200 status): 91
- Broken: 1

#### Local Images
- Valid (file exists): 0
- Missing: 21

---

## Issues Found

### 1. Broken Unsplash URL (404)

**File:** `the-posture-problem.mdx`
- **URL:** https://images.unsplash.com/photo-1734634248767-16fd30f19cfa?q=80&w=2000
- **Status:** 404
- **Action Required:** Replace with a different Unsplash image

---

### 2. Missing Local Files (21 files)

The following blog posts reference local images that don't exist in the expected location:

| File | Expected Path |
|------|--------------|
| almost-flickday.mdx | `/content/images/2025/06/Almost-Flickday-in-the-Studio--1--1.png` |
| bts-why-we-had-to-slow-down-to-speed-up.mdx | `/content/images/2025/08/photo-1706618184116-425c7aaec79c.jpeg` |
| even-the-ai-is-confused.mdx | `/content/images/2025/08/photo-1635850967683-17df1f33e749.jpeg` |
| living-in-the-comments.mdx | `/content/images/2025/06/photo-1555601568-c9e6f328489b-2.jpeg` |
| m-ai-engineering-team.mdx | `/content/images/2025/07/photo-1600880292089-90a7e086ee0c.jpeg` |
| not-just-fast-but-together.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-25--2025--11_31_30-AM.png` |
| skip-the-api-building-a-local-chatgpt-bridge-for-vs-code.mdx | `/content/images/2025/07/12326509-scott-adams-graphic-adventure-4-voodoo-castle-apple-ii-making-ma.png` |
| standing-in-the-rain.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-4--2025--10_16_21-PM.png` |
| the-bet-i-didnt-know-i-was-making.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-4--2025--05_42_58-PM.png` |
| the-cake-is-a-lie-why-ai-isnt-ready.mdx | `/content/images/2025/06/cake.webp` |
| the-cost-of-sophistication.mdx | `/content/images/2025/06/photo-1485236715568-ddc5ee6ca227.jpeg` |
| the-cost-of-staying-dry.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-5--2025--12_16_21-AM.png` |
| the-gift-i-cant-give-myself.mdx | `/content/images/2025/06/photo-1588514821696-0b59b1080071.jpeg` |
| the-stranger-with-my-name.mdx | `/content/images/2025/06/photo-1635605980271-23c65563badb.jpeg` |
| this-doesnt-work-for-me.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-5--2025--12_19_16-AM.png` |
| what-coaching-teaches-me-about-consulting.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-4--2025--06_00_47-PM.png` |
| when-custom-isnt-better-the-burden-of-bespoke.mdx | `/content/images/2025/06/photo-1633655442356-ab2dbc69c772.jpeg` |
| why-i-keep-shooting-even-when-its-not-for-work.mdx | `/content/images/2025/06/falknor-2.jpg` |
| why-this-made-you-ask.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-6--2025--11_39_12-AM.png` |
| writing-helped-me-notice-i-was-seeing-differently.mdx | `/content/images/2025/06/photo-1540162875225-3f6b56d69fe8.jpeg` |
| youre-not-broken-but-youre-not-off-the-hook.mdx | `/content/images/2025/06/ChatGPT-Image-Jun-5--2025--02_44_25-PM.png` |

**Expected Directory:** `/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/public/content/images/`

**Action Required:**
- Add the missing image files to the appropriate directories, or
- Update the frontmatter to use Unsplash URLs instead

---

### 3. Files Without Feature Images (66 files)

The following posts don't have a `featureImage` field in their frontmatter:

<details>
<summary>Click to expand list (66 files)</summary>

- about-me.mdx
- aegis-framework-constitutional-crisis-we-declared-martial-law-on-ourselves.mdx
- agentic-software-isn-t-magic-it-s-a-new-interface-for-an-old-problem.mdx
- ai-agents-need-a-cop.mdx
- ai-ops-docs-as-contracts.mdx
- ai-wont-take-your-job-it-will-redefine-it-your-reskilling-starts-now.mdx
- beyond-the-copilot-architecting-for-autonomy-with-claude-sonnet-45.mdx
- building-cages-for-ai-agents.mdx
- debunking-the-svelte-ai-myth-69-production-components-dont-lie.mdx
- designing-for-environments-not-just-themes-a-volleyball-app-ux-case-study.mdx
- designing-what-you-dont-build.mdx
- do-i-still-sound-like-me.mdx
- docs-as-code-isnt-enough-how-ai-ready-knowledge-layers-compress-weeks-of-work-into-hours.mdx
- fix-it-once-prevent-it-forever-how-i-made-a-dropdown-bug-impossible-to-reintroduce.mdx
- from-fear-to-flow-my-accidental-journey-into-ai-powered-development.mdx
- from-prompt-to-product-building-demo-mode-in-week-2.mdx
- from-qa-bottleneck-to-autonomous-confidence-how-i-built-a-fully-ai-driven-e2e-testing-framework.mdx
- grid-level-thinking-wasnt-the-plan.mdx
- how-content-and-commerce-actually-connect-now.mdx
- how-i-built-signal-reflex-in-a-week.mdx
- how-i-structure-my-ai-workflows-to-support-real-thinking.mdx
- how-i-use-ai-in-consulting-for-real.mdx
- i-didnt-write-a-test-i-asked-the-system-to-reflect.mdx
- i-dont-believe-the-agentic-ai-hype-and-heres-why-thats-not-ignorance.mdx
- i-let-a-bunch-of-ai-agents-rebuild-my-app-heres-what-actually-worked.mdx
- i-still-dont-really-know-jsx-and-i-dont-think-it-matters.mdx
- if-the-storefront-is-dead-where-do-you-compete-now.mdx
- intent-driven-engineering-by-the-numbers.mdx
- ive-been-doing-ai-coding-wrong-sort-of.mdx
- llm-codegen-and-the-three-little-pigs.mdx
- moores-law-is-sputtering-so-whats-really-next-for-tech.mdx
- one-week-one-developer-one-production-system-how-i-used-ai-to-build-and-harden-the-lpo-bracket-manag.mdx
- pay-no-attention-to-the-man-behind-the-curtain.mdx
- plug-in-then-rethink-the-system.mdx
- power-without-purpose-is-just-a-bill.mdx
- putting-my-money-where-my-mouth-is.mdx
- quiet-was-armor.mdx
- shipping-with-ai.mdx
- show-your-work-designing-ai-enforced-safeguards.mdx
- start-smart-not-perfect.mdx
- the-710-year-evolution-of-the-web.mdx
- the-coming-code-why-ai-native-software-needs-standards-and-how-to-prepare.mdx
- the-consultants-dilemma-the-tax-of-many-hats.mdx
- the-elitist-trap.mdx
- the-emperor-has-no-rag-why-your-genai-strategy-is-built-on-sand-unless-you-ask-these-questions.mdx
- the-entry-level-developer-evolution-not-extinction.mdx
- the-modern-js-stack-is-a-masterpiece-of-power-and-a-catastrophe-of-experience.mdx
- the-new-consulting-model-adapt-or-die.mdx
- the-next-compiler-is-semantic.mdx
- the-role-of-self-awareness-in-every-tool-i-use.mdx
- the-storefront-is-dead.mdx
- the-storefront-isnt-dead-its-becoming-an-ai-optimized-validation-engine-in-a-shifting-commerce-lands.mdx
- tokens-are-dev-hours.mdx
- toolmaker-or-tool-user-finding-your-true-nature-in-the-ai-age.mdx
- what-my-jsx-free-react-app-really-taught-me-about-ai-coding.mdx
- when-control-matters-behind-the-decision-to-build-feature-toggles-into-the-bracket-app.mdx
- when-fast-isnt-fast-enough-the-shift-from-ai-coding-to-ai-concurrency.mdx
- when-your-framework-outgrows-your-ability-to-explain-it.mdx
- why-i-shoot-senior-nights.mdx
- why-i-started-signal-reflex.mdx
- why-i-use-ai-every-day-and-why-i-started-writing-about-it.mdx
- why-my-react-app-doesnt-use-jsx-and-what-that-taught-me-about-building-with-ai.mdx
- why-they-call-me-uncle-nino-an-evolving-leadership-style.mdx
- wired-for-power-ai-is-the-grid-youre-the-architect.mdx
- wired-for-power-everyone-got-the-current-not-everyone-built-the-city.mdx
- you-cant-engineer-growth.mdx

</details>

**Action Required:** Add featureImage URLs to these posts if they should have feature images.

---

## Recommendations

1. **Immediate Fix Required:**
   - Replace the broken Unsplash URL in `the-posture-problem.mdx`
   - Locate or replace the 21 missing local image files

2. **Content Audit:**
   - Review the 66 posts without feature images and decide if they should have them
   - Consider standardizing on Unsplash URLs to avoid file management issues

3. **Future Prevention:**
   - Consider implementing a pre-commit hook to validate feature images
   - Migrate local images to a CDN or Unsplash for better reliability
   - Add feature image validation to CI/CD pipeline

---

## Technical Details

- **Script:** `/Users/nino/Workspace/dev/products/bc-migration/validate-feature-images.js`
- **JSON Report:** `/Users/nino/Workspace/dev/products/bc-migration/feature-images-validation-report.json`
- **Blog Directory:** `/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/src/content/blog`
- **Public Directory:** `/Users/nino/Workspace/dev/sites/signal-dispatch-blog/astro-build/public`
