---
name: frontend-design
description: Guidance for designing and implementing modern, high-quality, responsive, and visually appealing frontend user interfaces. Use when creating UI components, designing visual layouts, crafting CSS styles, optimizing user experience (UX), ensuring web accessibility (a11y), and building dynamic frontend applications.
---

# Frontend Design & UI/UX Best Practices

This skill provides comprehensive instructions for designing and implementing production-grade frontend applications. Follow these guidelines to produce distinctive, accessible, responsive, and high-performance user interfaces.

---

## 1. Core Principles

### Avoid Generic AI Aesthetics
- **Intentional Design**: Choose distinct visual directions suited to the application context (e.g., sleek dark mode, clean glassmorphism, editorial typography, or modern minimalism) rather than standard browser defaults.
- **Curated Color Palettes**: Use cohesive HSL/RGB CSS variables with purposeful primary, surface, accent, and semantic status colors (success, warning, error, info).
- **Modern Typography**: Use clean font pairings (e.g., Inter, Outfit, Roboto, JetBrains Mono) with clear visual hierarchy, line heights (1.4 - 1.6 for body, 1.1 - 1.2 for headings), and letter spacing.

### Responsive & Layout Standards
- **Mobile-First & Fluid Layouts**: Build responsive designs using CSS Grid, Flexbox, and fluid typography (`clamp()`).
- **Standard Breakpoints**: Define breakpoint variables for Mobile (<640px), Tablet (640px - 1024px), Desktop (1024px - 1280px), and Large screens (>1280px).
- **Grid Systems & Spacing**: Maintain consistent 4px/8px spacing scales (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`) for margins, padding, and gaps.

---

## 2. Component Engineering Architecture

### Separation of Concerns
- **Container vs. Presentational Components**: Keep data fetching, state logic, and side-effects separated from presentational rendering.
- **Component Reusability**: Design self-contained, composable UI components with clearly typed props (e.g., TypeScript interfaces).
- **Design Tokens**: Centralize tokens in CSS variables (`--color-primary`, `--bg-surface`, `--radius-md`, `--shadow-lg`, `--transition-fast`).

### Interactive Feedback & Micro-Animations
- **Hover & Focus States**: Provide immediate interactive feedback for buttons, links, and card elements.
- **Accessible Focus Rings**: Never remove `outline: none` without providing explicit, high-contrast focus indicators (`:focus-visible`).
- **Smooth Transitions**: Apply subtle CSS transitions (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`) for state changes.
- **Loading & Skeleton States**: Use shimmer skeleton loaders instead of jarring layout shifts (CLS) when fetching async data.

---

## 3. Web Accessibility (WCAG 2.1 AA)

- **Semantic HTML**: Use proper HTML elements (`<main>`, `<nav>`, `<article>`, `<header>`, `<footer>`, `<section>`, `<button>`).
- **Contrast Ratios**: Maintain minimum 4.5:1 contrast for normal text and 3:1 for large text/icons.
- **Keyboard Navigation**: Ensure all interactive controls are operable using `Tab`, `Space`, `Enter`, and arrow keys.
- **ARIA Attributes**: Use `aria-label`, `aria-expanded`, `aria-describedby`, and `role` attributes where native HTML elements are insufficient.

---

## 4. Performance & UX Optimization

- **Core Web Vitals**: Minimize Cumulative Layout Shift (CLS), optimize Largest Contentful Paint (LCP), and keep Interaction to Next Paint (INP) low.
- **Image & Media Optimization**: Use modern image formats (WebP/AVIF), explicit `width`/`height` attributes, and lazy loading (`loading="lazy"`).
- **State Management**: Keep local state as close to consuming components as possible. Avoid unnecessary global re-renders.
- **Form UX & Validation**: Provide inline, immediate validation messages with clear error states and descriptive guidance.

---

## 5. Verification Checklist

Before submitting frontend code, verify:
1. [ ] Responsive across mobile, tablet, and desktop viewports.
2. [ ] Accessible keyboard navigation and proper visual focus indicators.
3. [ ] No hardcoded inline style overrides where CSS variables/classes should be used.
4. [ ] Proper error handling, empty states, and loading indicators.
5. [ ] Fast initial load without severe layout shifting.
