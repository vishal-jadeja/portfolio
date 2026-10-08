# Portfolio interaction preferences

Use subtle animation for new or updated UI features when it improves feedback, clarity, or flow. In particular, expandable content should open and close smoothly, and page navigation should provide gentle visual feedback. Keep motion brief, avoid delaying navigation, and respect `prefers-reduced-motion` with an immediate, usable fallback.

Keep public section and page headings consistent using `section-title`, `section-heading` or `section-title-spaced`, and `section-description`. Use `site-gutter` / `--page-gutter` for outer horizontal padding (20px below 640px, 32px otherwise). Reuse the shared heading and spacing tokens instead of per-section values; retain the distinct hierarchy of card titles and article prose.
