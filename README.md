# Tastemap — Product Challenge

Your definitive map of where to eat — a personal, honestly-ranked record of every place you've been and every place you still want to try.

![Preview of Tastemap](/public/preview.jpg)

*This is a design concept image, not the intended design. There's no Figma file — you make the design decisions.*

## The Challenge

Tastemap is a **Product Challenge** on [Frontend Mentor](https://www.frontendmentor.io). There's no Figma file — you make the design decisions. You ship a real, deployed product with a database, authentication, and an interactive map. The result is a portfolio piece that shows employers your product thinking and your engineering in one place.

The wedge: star ratings are useless. When everything you like is a 4 or a 5, you can't tell your third-favourite taco place from your tenth. Tastemap replaces absolute ratings with **relative** ones — a place earns its position by being compared, head-to-head, against places you've already been. The payoff is an ordered list you actually trust, laid over a map of your city.

### Four Pillars

| Pillar | What It Means for Tastemap |
|--------|----------------------------|
| **Product Thinking** | You design the ranking experience (how many comparisons, how a rank is shown, how re-ranking works), the "where should we eat?" decision moment, and how the map and ranked list relate. These are genuine product decisions with no single right answer. |
| **Design Taste & Craft** | The brand kit gives you colors, type, and spacing. The map, the ranked list, the "which was better?" comparison card, and the place detail view are yours to compose — this is explicitly *not* a dashboard. |
| **AI Collaboration** | The project includes AI context files (`AGENTS.md`, `CLAUDE.md`) that give tools like Claude full project context. Lean into AI across planning, building, and polishing. |
| **Shipping Real Products** | Deploy to a live URL. Real database. Real auth. A real interactive map built on free, keyless OpenStreetMap tiles, and a ranking algorithm that has to stay efficient as the list grows. |

## What You're Building

Tastemap is where you keep the honest truth about where you eat. You log a place with a location, cuisine, and price; mark it as **been** or **want to try**; and when you mark something *been*, the app asks you a few quick "which was better?" questions to slot it into your ranked list. The result is a living map of your taste and a leaderboard you can actually act on.

- **Place management** — add, edit, and delete places with location, cuisine, price, tags, and a personal note
- **Interactive map** — every place as a pin on a real, pannable, zoomable map, with clustering and been/want-to-try distinction
- **Comparison-based ranking** — earn a place's position through head-to-head questions, not star ratings
- **Ranked list** — a browsable, ordered leaderboard of your "been" places, plus a distinct want-to-try list
- **Search & filter** — narrow by name, cuisine, price, status, and tag across both the map and the list at once
- **Landing page & guest mode** — a compelling front door and a one-click "Try as Guest" pre-loaded with a real city

### The Guest Experience

When you share this project — in your portfolio, a job application, or a social post — the person clicking your link isn't going to create an account. Guest mode is what lets them see your work instead of a login wall.

Your landing page includes a "Try as Guest" button. Guests enter the app in a single click, pre-loaded from `data/sample-places.json`: a lived-in London food map of 32 real places (14 ranked, 18 want-to-try) and 25 comparisons. They can browse the map, the ranked list, and detail views, and even run a comparison — all in-session, with gentle (never aggressive) prompts to sign up and save their own. A city dotted with pins and a ready-made top-10 makes the value obvious in seconds.

## Project Structure

```
tastemap/
├── spec/
│   ├── product-definition.md      # What, who, why
│   ├── core-requirements.md       # 13 features: 9 core + 4 stretch
│   ├── design-challenges.md       # 3 features YOU design
│   ├── technical-requirements.md  # Keyless map, database, auth, deployment — + frontend-only path
│   └── differentiators.md         # 5 enhancements — pick 1-2
├── guidance/
│   ├── brand-kit.md               # The "Grove" palette, typography, spacing, icons, map/pin system
│   ├── patterns.md                # UI/UX do's and don'ts
│   └── accessibility.md           # WCAG checklist
├── starter/
│   ├── tokens.css                 # CSS custom properties (Grove tokens, light + dark)
│   └── tailwind.css               # Optional Tailwind v4 config
├── data/
│   ├── sample-places.json         # 32 London places + 25 comparisons (the guest dataset)
│   └── README.md                  # Data shape, the ranking model, edge cases
├── AGENTS.md                      # AI collaboration context
├── CLAUDE.md                      # Points to AGENTS.md
└── README-template.md             # Template for your solution README
```

## Getting Started

1. **Read the spec** — Start with `spec/product-definition.md`, then `core-requirements.md`. Understand what you're building — and why star ratings are the enemy — before you write code.

2. **Review the brand kit** — `guidance/brand-kit.md` gives you the "Grove" visual foundation (a fresh herb-green palette with a honey accent, Bespoke Serif over Switzer). Use it as your starting point — or, if you have a clear design vision of your own, create your own brand kit and go in a different direction. The starter CSS tokens and optional Tailwind config are ready to use.

3. **Explore the patterns** — `guidance/patterns.md` provides UI/UX do's and don'ts for the map+list layout, the comparison card, and the detail view — guidance that will help you make strong design decisions without a Figma file.

4. **Choose your stack** — This challenge is framework-agnostic. Next.js, Nuxt, SvelteKit, Remix, Astro — whatever you're most productive with. The recommended path is full-stack (database + auth), but there's a **frontend-only alternative** (localStorage, single-user, no guest concept) if you want to focus on the map and the ranking UX — see `spec/technical-requirements.md`.

5. **Set up your AI workflow** — This project is designed for AI collaboration. `AGENTS.md` and `CLAUDE.md` give AI tools full context about the project — specs, guidance, and collaboration approach. We recommend working with AI across every phase: planning, building, and polishing.

6. **Pick your differentiators** — Read `spec/differentiators.md` and choose 1-2 that match your interests (shareable maps, keyless place-search, a "your year in food" recap, multi-city travel mode, or runtime place logos with a fallback). These are what make the project _yours_.

7. **Start building** — Begin with foundation (auth, database, and getting a keyless map rendering pins), then layer in place management, the ranking flow, and search/filter. The core-requirements spec is your roadmap. Core features give you a solid product; Stretch features take it to the next level.

8. **Document as you go** — Use `README-template.md` for your solution README. Record design decisions, technical trade-offs, and lessons learned as they happen, not after — especially your reasoning on the three design challenges.

## Working with AI

Product Challenges are designed for AI collaboration. The `AGENTS.md` and `CLAUDE.md` files give AI tools like Claude, Cursor, and Copilot full project context — including the spec, brand kit, and collaboration guidelines. Load them at the start of each session.

Lean on AI for implementation, but don't just accept what it gives you. The design decisions are yours, and so is the code quality — review what gets generated, understand it, and make sure it's something you'd be happy putting your name on. The 3 design-it-yourself features (**the ranking experience**, **the "where should we eat?" moment**, and **map and list living together**) are where your product thinking matters most — think those through yourself before you let AI fill in the code.

## Your Solution Repo

The `.gitignore` is pre-configured to exclude challenge reference files (`spec/`, `guidance/`, `AGENTS.md`, etc.) from your solution repo. These files are your development reference — they stay on your machine for AI sessions and planning, but they don't belong in the finished product.

Your public repo should contain:

- Your application code
- Your completed README (rename `README-template.md` → `README.md`)
- The sample data file (`data/sample-places.json` — needed for the guest experience)
- The starter tokens (consumed by your build)

This is how real products work: you reference the spec during development, you ship the product.

## Learning Outcomes

By completing this challenge, you'll have demonstrated:

- Integrating a real interactive map (keyless OpenStreetMap tiles via Leaflet/MapLibre) with custom markers, clustering, and keyboard access
- Designing and implementing an efficient ranking algorithm (e.g. binary-insertion) and a comparison UX that stays fast as the list grows
- Keeping two views of one dataset — a spatial map and an ordered list — in sync across filters, selection, and screen sizes
- Modelling relational data (places, comparisons, lists) and choosing whether to store raw comparisons, resolved positions, or both
- Building real authentication plus a session-scoped guest mode that never touches your database
- Deploying a performant, accessible, responsive product to a live URL and reasoning about the trade-offs you made

## Key Design Moments

These screens are where your design taste will be most visible:

1. **Map + ranked list together** — the home screen. The rail and the map must feel like one product, not two panes stapled together; pins, list rows, and hover states should be visibly linked.
2. **The comparison ("which was better?")** — the signature moment. This tiny decision UI is what makes Tastemap memorable; it deserves disproportionate craft (clear options, a sense of progress, keyboard support, a graceful "too close to call").
3. **Landing page** — the first impression and the shareable front door. Sell the wedge in one line and show the map full of pins immediately.

## Deploying Your Project

Product Challenges require a live, publicly accessible URL. Recommended hosts:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)
- [Fly.io](https://fly.io/)

Make sure your environment variables are configured correctly and no secrets are exposed. Test your deployed URL in an incognito window before submitting — especially the guest experience. Note that map tiles and markers can hurt performance and accessibility scores if handled carelessly — lazy-load the map and keep marker rendering efficient.

For more guidance, see our [hosting guide](https://www.frontendmentor.io/guides/hosting-your-solution).

## Submitting Your Solution

Submit your solution on the platform for the rest of the community to see. Follow our [guide to submitting solutions](https://www.frontendmentor.io/guides/how-to-submit-solutions) for the full process.

When submitting, you'll need:

- **Live site URL** — Submit the URL to your guest experience (e.g., `your-app.vercel.app/guest`), not the landing page. This ensures our solution reporters analyse your product code rather than the homepage. Test in incognito first.
- **Repository URL** — A public repo with your solution code and completed README

For your retrospective, Product Challenges give you a lot to write about — the ranking design, the map+list relationship, AI collaboration, technical trade-offs. Be specific about what you're proud of and where you'd like feedback. See our [guide to writing effective retrospectives](https://www.frontendmentor.io/guides/write-an-effective-retrospective) for tips.

## Sharing Your Solution

Product Challenges create portfolio pieces worth sharing beyond the platform:

1. Share your solution page in the **#finished-projects** channel of our [community](https://www.frontendmentor.io/community).
2. Post on LinkedIn or X — include both your live URL and repo link. The guest experience means anyone clicking your link sees the product immediately.
3. Add it to your portfolio — see our [guide to using challenges in your portfolio](https://www.frontendmentor.io/guides/use-challenges-in-your-portfolio).
4. Blog about your experience. The ranking-algorithm design, AI collaboration journey, and map integration make for compelling content. Great platforms to write on are [dev.to](https://dev.to/), [Hashnode](https://hashnode.com/), and [CodeNewbie](https://community.codenewbie.org/).

## Questions?

If anything in the spec is unclear or you want to discuss the challenge, join our [Discord community](https://www.frontendmentor.io/community).

## Got Feedback for Us?

We love receiving feedback! If you have anything you'd like to mention, please email hi[at]frontendmentor[dot]io.
