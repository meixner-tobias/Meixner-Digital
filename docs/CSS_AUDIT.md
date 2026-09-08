# CSS / visual layer dependency audit (baseline before reset)

All original-code line numbers refer to the pre-reset Git checkpoint; the audit agent also captured a temporary source snapshot. The complete parsed per-rule/per-declaration inventory is in `css-audit-inventory.json`. The analysis read all first-party CSS, all 35 HTML pages, the complete application JavaScript, Python scripts/notebook, SVGs and asset manifest. The local .venv is environment/generated dependency content and excluded from authored-code counts.

## Scope and architecture

- Static bilingual HTML site, one linked runtime stylesheet `css/style.css`: 4,478 lines, 1,300 qualified rules including 12 keyframe-step rules (1,288 ordinary rules), 4,655 declarations, 106 `!important` declarations. No CSS imports, @font-face, preprocessing, modules, framework styling runtime or cascade layers.
- Two unlinked historical migration snapshots: `scripts/all_page_styles.css` (1,343 qualified rules) and `scripts/page-styles-append.css` (486). No tracked source references their filenames, no HTML links/imports. They duplicate old page CSS and can restore old visuals if manually reapplied; they are not live cascade layers.
- 690 inline style attributes across all 35 site HTML pages contradict the master stylesheet header's single-source claim. No literal HTML `<style>` blocks. Every page also injects a localhost-only style string to hide CookieScript as part of the consent test bypass. That logic is integration scope, not decorative CSS cleanup.
- Google Fonts Plus Jakarta Sans loaded via preload/onload stylesheet swap and noscript fallback across pages. Font imports are pure visual dependencies, but privacy-page statements about Google Fonts are content and must not be silently rewritten.
- CSS theme = dark-first `:root` tokens plus `[data-theme="light"]` token values, legacy aliases and later `html:not([data-theme="light"])` overrides. JS/localStorage maintains theme. Inline SVG icons and client/product/profile images are source assets; no icon font. JS animation vendors are GSAP/ScrollTrigger, Lenis and Three.js (root JS audit covers complete startup paths).

## Confirmed findings

- P1 `css/style.css:706-710`: `.nav-cta:hover` declares accent color then overwrites it with `color:#fff!important`, while background becomes transparent. On the light page background #FAFAFA this yields almost invisible CTA text. Earlier higher-specificity `.nav-links a.nav-cta:hover` cannot beat `!important`. Reset removes all hover design.
- P1 `css/style.css:1462-1507`: `.reveal` starts `opacity:0`; without JS/init success it never becomes visible. Reduced-motion CSS compensates only for users requesting reduced motion. Reset must remove reveal initial state and its JS animation initialization together.
- P1 `css/style.css:2705-2707`, `js/main.js` FAQ routine: answers collapsed with max-height/overflow, expanded hard-capped at 600px. Overflow can truncate long answers at high zoom/narrow viewports, and visual clipping alone does not remove links from keyboard focus. JS closing logic uses a 500ms delay; use immediate hidden/inert/native details state before deleting animation.
- P1 `css/style.css:2998-2999`: `.addon-textarea:focus {outline:none}` overrides the lower-specificity generic keyboard focus ring, with only a subtle border-color change remaining. Reset restores native focus; no outline suppression retained.
- P2 `css/style.css:948-965`: transform assigned twice within the same rule. The first is dead by declaration order. Hover/focus-within + delayed visibility is functionally coupled; replace with native details or explicit immediate hidden state before removing.
- P2 `css/style.css:1986-2053`: desktop project details hides summary and attempts to force closed details content display through a descendant rule. This assumes browser details rendering implementation; native summary/open semantics are the robust neutral baseline. Verify this behavior with actual browser; do not claim a confirmed cross-browser regression solely from CSS inspection.
- P2 `css/style.css:467-492,1403-1405,1687,1811,1861,1920,4358,4412,4420`: generic surface/theme-transition layer, component declarations and later mobile highlight layer repeatedly replace whole transition shorthands. For example `.proj-card` background transition at 1920 replaces its transform/shadow transition at 1861; `.own-card` restores a different shorthand at 4420. Existing design is historically layered, not one coherent motion system.
- P2 `css/style.css:1216-1249,2834-2842`: mobile language buttons need 26 important declarations plus 6 later dark-theme important declarations to defeat global drawer anchor rules. Remove decorative cascade rather than retain this specificity ladder.
- P2 global `body {overflow-x:hidden}` at 281-289 masks layout overflow. Multiple fixed-column grids depend on a specific breakpoint. Native document flow plus media/control containment and scrollable code/tables avoids clipped content after reset.
- P3 `.burger:focus-visible` at 727 and 1437 is an exact duplicate. Five complete selector strings repeat in the same context (img, light theme root, burger focus, drawer summary open, founder project card); 111 repeat across base/theme/media contexts. Repeated media selectors are not automatically defects.
- P3 `css/style.css:1477-1497`: generic reduced-motion override at 1440 shortens durations but leaves reveal delays; later reduced-motion reveal transition:none compensates for reveal specifically. `html scroll-behavior:smooth`, CSS durations and GSAP/Lenis are separate motion layers.

## Parsing and specificity

All three CSS files parse without stylesheet/declaration syntax errors. cssselect2 does not support seven WebKit scrollbar/details pseudo-element rules; these are parser capability exclusions, not proven CSS syntax errors. Browser CSS.supports/property validation is a separate runtime check.

Maximum own component specificity is (0,5,2), e.g. theme + open details/hover + source-substring selector for logos at 2018-2023. CookieScript ID hover overrides are (1,1,0). Tokenized z-nav=1000/z-overlay=1200 coexist with drawer=199, blog dropdown=300 and language dropdown=999; --z-drawer=1100 is never used. The header's stacking context contains its dropdown layers; the body drawer is a separate context. Background canvas z=0, hero inner z=1, floating cards z=2; reveals/transforms/opacity/filter create many additional contexts. In-flow navigation eliminates these local overlay dependencies.

## Tokens and responsive layout

74 custom-property names defined, 5 with no var() references anywhere in authored runtime CSS/HTML/JS: --s-1, --s-8, --s-9, --s-10, --z-drawer. --float-y is written dynamically by main.js and all CSS uses have a 0px fallback; it is NOT an undefined-variable bug. --fd and --fb are identical font stacks; --accent and --accent-text are identical per theme; --navy is legacy alias for text; indigo aliases coexist with accent tokens. Most spacing/radii/typography still use hard-coded values despite tokens, and many old white/green/orange backgrounds require dark overrides.

40 media blocks / 14 distinct conditions: 380,390,480,560,600,640,760,768,769,900,1024px plus hover/reduced-motion. 8 max-768 blocks, 5 max-1024, 4 min-769, 4 max-640, 4 max-560. `min-width:900px` overlaps `max-width:900px` exactly; these affect different own-product layout properties and are not by themselves a contradiction. 768/769 creates a fractional width interval; navigation JS uses innerWidth>=769, so use a single max768 MediaQueryList if preserving the mobile boundary. Repeated unchanged columns at 390/560/768 (skills/process) are redundant. Hero/legal/about use 100vh followed by 100svh as intentional fallback, not duplicate error. Drawer uses svh properly; CookieScript 62vh still needs scroll/viewport validation. Most layout grids use plain 1fr beside hard pixel columns; article/legal and image sections already contain min-width:0 patches. Pictures use display:contents as a compensating patch for overlapping device mockups; that rule is unnecessary once these decorative grids are removed.

## All CSS animations

- blink: keyframes 596; .bdot starts it at 593; opacity/scale availability decoration. No first-party end-event coupling.
- morph: keyframes 1511; no live animation declaration invokes it (.img-blob animation:none at 1625). Only old snapshot CSS and unrelated Three.js identifiers contain the word; dead runtime keyframe.
- floaty: keyframes 1518; .fc-1 through .fc-4 at 1654-1657 run transform loops. Also JS/GSAP float control targets these elements; competing transform ownership exists.
- ownProductPulse: keyframes 3220; .own-product-pulse at 3215 references it, but neither pulse nor parent status class exists in HTML/runtime JS. Dead component/keyframes, not externally supplied.
- pulse-green: keyframes 4315; .avail-dot at 4313; box-shadow loop. Pure decoration.
- Every transition declaration is available in per-rule inventory. Functional states affected: drawer transform/opacity; dropdown opacity/visibility delay; language-arrow rotation; FAQ max-height; skip-link top; theme transitions. All can be immediate after state refactor. Other hover/reveal/filter/icon/card/link-gap transitions are decorative. Animation of FAQ max-height, skip top, link gap and nav underline right changes layout/paint, not just compositor state. .char/.word and [data-float] hold permanent will-change; .reveal releases it only after JS state change.

## A/B/C removal contract

A: All authored palette/token/theme styling, shadows/gradients/font dependencies, ornamental border/radii/spacing, pseudo-element accents, hero/canvas decorations, component grids/flex positioning, bespoke breakpoints, decorative transforms/reveals/keyframes/hover transitions after JS detachment. Two old unlinked CSS snapshots are A. A classification does not authorize deleting content DOM/class hooks based on appearance.

B (must preserve behavior, not necessarily original declaration): sr-only; accessible focus indication (native UA sufficient); skip target/link remains usable in normal flow; media and form width containment; table/code scroll containment; hidden state for drawer/language menu/form errors/success/addon panels; keyboard-safe collapsed FAQ contents; native details/summary. In the new runtime all custom show/hide transitions should use hidden, with `[hidden] {display:none!important}` as the single important rule. Original form-success/form-error-msg/field-error CSS must not be removed before markup/JS initialize hidden states. Form controls must remain native, labelled and disabled during submission.

C: Third-party CookieScript DOM selectors are runtime-generated, never dead merely for missing static markup. Its branding overrides are A; mobile max-height/overflow protection is C until actual provider fallback is inspected. Keep external scripts/consent behavior unchanged. Asset/class hooks without current references remain uncertainty if externally linked or public URLs; do not remove them opportunistically. Preserve lightbox-trigger hook (no first-party lightbox implementation found) until ownership is clarified. Keep first-party IDs/classes used by JS/content links even when their CSS is removed.

## Asset and dead-code classification

Repository-wide full path/basename matching includes HTML/srcset, inline SVG, JSON-LD/OpenGraph/Twitter metadata, JS, Python/notebook, CSS and site.webmanifest. Favicon 192/512 assets ARE referenced by manifest and must not be called dead. Profile/photos/logos and their PNG/JPEG fallbacks, sources/webp variants, certification badges, OpenGraph artwork and product screenshots all retain references.

Only four assets have no authored reference: assets/bikecare/icon-transparent.png, assets/bikecare/logo-dark.png, assets/img/logo.svg, assets/lebenslauf/Lebenslauf_personalSite.pdf. These are C candidates because public direct URLs/manual downloads/external references cannot be excluded from repo inspection; preserve them. No raster assets should be deleted for visual reset.

Unreferenced CSS component candidates (names absent from markup/runtime scripts) include blog-hero/blog-hero-inner, old service-modules family, select-wrap/form-select, own-product-status/pulse, old nav-drop-cluster/arrow, cluster-card-soon family and reveal variants. CookieScript classes are explicitly excluded from dead classification. Generic words such as lead/surface/invalid appear in prose/comments and are not genuine class references. Dynamic .char/.word/.case-card-num-bg/.in-view/.scrolled/.is-open are genuine JS output and must be detached before their behavior is removed. All candidates and exact reference matches are retained in inventory.json.

## Minimal baseline recommendation

Keep box-sizing; text-size-adjust; natural UA body margins/typography/focus; overflow-wrap:anywhere; images/svg/video max-width:100% and height:auto; control font:inherit/max-width:100%; fieldset min-inline-size:0; pre and existing .table-wrap overflow-x:auto; sr-only clipping; [hidden] display:none!important. Navbar and menus in document flow; progressive enhancement only hides desktop links at max768 once html[data-ui-ready] is set. Native details supplies blog menu and project accordions, and controls/links retain text labels. No color/font/token/theme/component design system, transforms, animation, transition, fixed positioning or universal overflow clipping.

## Validation boundary

This audit is static/parser-based. It does not certify third-party CookieScript layout, cross-browser behavior, actual browser console, touch/keyboard navigation, form success/failure submission or responsive screenshots. Those must be exercised by root validation after coordinated CSS+HTML+JS reset. No production stylesheet changed during discovery/audit.

## Implemented functional stylesheet

The replacement stylesheet retains: box sizing (B, predictable element containment); text-size-adjust (B, prevent mobile text auto-resizing breaking controls); body overflow-wrap (B, long URLs/words remain reachable); responsive image/SVG/video containment (B); native-font form controls with width containment (B); fieldset min-inline-size:0 (B, suppress intrinsic min-content overflow); pre/table wrapper scrolling (B); hidden display contract (B); sr-only utility (B); enhanced mobile navigation visibility (B, no-JS fallback stays visible). Native UA typography, margins, control borders, native details markers and focus styles remain.

CookieScript's original <=768px max-height:62vh and overflow-y:auto are conservatively retained as C pending live provider validation; its colors, typography, spacing and button styling overrides were removed. The two provider overrides and hidden contract are the only `!important` declarations. `#cookiescript_buttons` had only a margin override, with no functional state/layout dependency, so that decoration was not preserved.

No other first-party style rules, animation, transitions, theme tokens, fixed/sticky positioning, hero layout, custom grids, custom typography or color system are retained. Existing content hooks remain in HTML except animation-only attributes/elements removed after dependency audit by the HTML/JS owners.
