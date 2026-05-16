# Nexus Design System

## Brand Identity

### Product Vision
Nexus is a modern SaaS platform for workflow automation. The design reflects **professionalism**, **clarity**, and **efficiency** — avoiding the typical AI-generated purple/blue clichés.

### Brand Personality
- **Trustworthy** — Clean, predictable patterns
- **Modern** — Contemporary without being trendy
- **Approachable** — Not intimidating for non-technical users
- **Efficient** — Every element serves a purpose

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Slate 900** | `#0F172A` | Primary text, dark backgrounds |
| **Slate 800** | `#1E293B` | Secondary text, cards |
| **Slate 700** | `#334155` | Muted text, borders |
| **Slate 400** | `#94A3B8` | Placeholder, disabled |
| **Slate 200** | `#E2E8F0` | Borders, dividers |
| **Slate 100** | `#F1F5F9` | Background subtle |
| **Slate 50** | `#F8FAFC` | Page background |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Emerald** | `#059669` | Success, positive actions, CTAs |
| **Emerald Light** | `#10B981` | Hover states, highlights |
| **Amber** | `#D97706` | Warnings, attention |
| **Rose** | `#E11D48` | Errors, destructive actions |

### Light Theme Accents
| Name | Hex | Usage |
|------|-----|-------|
| **White** | `#FFFFFF` | Card backgrounds |
| **Transparent** | `rgba(255,255,255,0.8)` | Glass effects |

---

## Typography

### Font Family
```css
--font-sans: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero H1 | 72px / 4.5rem | 700 (bold) | 1.1 |
| H2 | 48px / 3rem | 600 (semibold) | 1.2 |
| H3 | 32px / 2rem | 600 | 1.3 |
| H4 | 24px / 1.5rem | 600 | 1.4 |
| Body Large | 18px / 1.125rem | 400 | 1.6 |
| Body | 16px / 1rem | 400 | 1.6 |
| Body Small | 14px / 0.875rem | 400 | 1.5 |
| Caption | 12px / 0.75rem | 500 | 1.4 |
| Mono | 14px / 0.875rem | 400 | 1.5 |

---

## Spacing System

Based on 4px grid:
```
xs: 4px    (0.25rem)
sm: 8px    (0.5rem)
md: 16px   (1rem)
lg: 24px   (1.5rem)
xl: 32px   (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
4xl: 96px  (6rem)
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small buttons, badges |
| `md` | 8px | Cards, inputs |
| `lg` | 12px | Modals, large cards |
| `xl` | 16px | Featured cards |
| `full` | 9999px | Avatars, pills |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards |
| `lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Elevated |
| `xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Modals |

---

## Motion Philosophy

### Principles
1. **Purposeful** — Animation communicates, not decorates
2. **Quick** — 150-300ms for interactions, 400-600ms for transitions
3. **Natural** — Ease-out curves feel responsive, ease-in-out for complex

### Durations
| Token | Value | Usage |
|-------|-------|-------|
| `fast` | 150ms | Hover states, micro-interactions |
| `normal` | 200ms | Standard transitions |
| `slow` | 300ms | Complex animations |
| `page` | 400-600ms | Page transitions, entrance animations |

### Easing
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);    /* Responsive */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1); /* Natural */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
```

### Common Animations
- **Fade in up** — Elements enter from below (staggered lists)
- **Fade in scale** — Modals, tooltips
- **Slide in right** — Sidebars, drawers
- **Pulse** — Loading states
- **Shimmer** — Skeleton loaders

---

## Component Patterns

### Buttons

#### Primary Button
- Background: Emerald (`#059669`)
- Text: White
- Hover: Emerald Light (`#10B981`) + slight scale(1.02)
- Active: Darken 10%
- Shadow: `0 1px 2px rgba(5, 150, 105, 0.3)`

#### Secondary Button
- Background: White
- Border: Slate 200 (`#E2E8F0`)
- Text: Slate 700
- Hover: Slate 100 background

#### Ghost Button
- Background: Transparent
- Text: Slate 600
- Hover: Slate 100 background

### Cards
- Background: White
- Border: 1px Slate 200
- Border Radius: 8px
- Padding: 24px
- Shadow: `sm` (default), `md` (hover)
- Transition: 200ms ease-out

### Inputs
- Background: White
- Border: 1px Slate 200
- Border Radius: 8px
- Padding: 12px 16px
- Focus: 2px Emerald outline
- Placeholder: Slate 400

### Badges/Pills
- Border Radius: Full (9999px)
- Padding: 4px 12px
- Font: Caption (12px), 500 weight
- Colors:
  - Success: Emerald bg (10% opacity), Emerald text
  - Warning: Amber bg (10% opacity), Amber text
  - Error: Rose bg (10% opacity), Rose text
  - Neutral: Slate 100 bg, Slate 700 text

### Navigation
- Background: White with bottom border Slate 200
- Height: 64px
- Items: Slate 600, hover Emerald
- Active: Emerald with bottom indicator

---

## Layout System

### Page Width
- Max container: 1280px
- Padding: 24px (mobile), 48px (desktop)
- Gutter: 24px

### App Layout
```
┌─────────────────────────────────────────────┐
│  Header (64px)                              │
├────────────┬────────────────────────────────┤
│            │                                │
│  Sidebar   │  Main Content                 │
│  (240px)   │  (flex-1)                     │
│            │                                │
│            │                                │
└────────────┴────────────────────────────────┘
```

### Content Spacing
- Section spacing: 96px (desktop), 64px (mobile)
- Card gap: 24px
- Element gap: 16px

---

## Iconography

### Style
- Style: Outlined
- Stroke width: 1.5px
- Size: 20px (default), 16px (small), 24px (large)
- Color: Inherits text color

### Icon Set
Lucide React (consistent with current implementation)

---

## Landing Page Structure

### 1. Hero Section
- Large headline (72px)
- Subheadline (18px, max-width 600px)
- Dual CTAs: Primary (Start Free) + Secondary (See Demo)
- Animated illustration/product screenshot
- Background: Subtle gradient or mesh pattern

### 2. Trusted By (Social Proof)
- Logo carousel of recognizable companies
- Grayscale, opacity 60%, hover full color

### 3. Features Grid
- 3-column layout (1 on mobile)
- Icon + Heading + Description
- Hover: Subtle lift animation

### 4. How It Works
- 3-step process with numbered cards
- Visual connector line
- Step 1: Connect apps
- Step 2: Build workflows
- Step 3: Automate

### 5. Integrations Showcase
- Grid of integration logos (Google, Slack, etc.)
- "50+ integrations" badge

### 6. Testimonials
- Card carousel
- Quote, avatar, name, company

### 7. Pricing
- 2-tier: Starter ($12/mo) + Pro ($29/mo)
- Feature comparison list
- Highlighted "Pro" tier
- Annual discount toggle

### 8. CTA Section
- Full-width dark section
- Compelling headline
- Single prominent CTA

### 9. Footer
- Logo
- Links: Product, Company, Resources, Legal
- Social icons
- Copyright

---

## Dark Mode (Future)

### Background Colors
- Base: `#0F172A`
- Surface: `#1E293B`
- Elevated: `#334155`

### Text Colors
- Primary: `#F8FAFC`
- Secondary: `#94A3B8`
- Muted: `#64748B`

---

## Design Don'ts

1. **No purple/blue gradients** — Avoid purple primary colors
2. **No excessive shadows** — Keep it subtle
3. **No decorative elements** — Every element has purpose
4. **No emoji icons** — Use consistent icon set
5. **No overly rounded corners** — Max 16px radius

---

## Implementation Notes

- Use CSS variables for all tokens
- Tailwind for utility classes
- Framer Motion for animations
- CSS Grid for layouts
- Flexbox for component internals