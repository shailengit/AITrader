# Frontend Layout Rules (MANDATORY)

## Layout Constraints
- Always wrap content in a centered container
- Max width must be between 1200px and 1400px
- Never allow full-width stretching on large screens

## Responsive Design
- Must support breakpoints:
  - 640px (mobile)
  - 1024px (tablet)
  - 1440px (desktop)
  - 1920px (large desktop)
  - 2560px+ (4K)

## Grid System
- Use CSS Grid for page layout
- Use auto-fit with minmax:
  repeat(auto-fit, minmax(280px, 1fr))

## Component Constraints
- All cards/components must have:
  - min-width: 250px
  - max-width: 400px

## Spacing
- Use consistent spacing scale (8px system)
- Avoid large empty gaps

## Typography
- Use clamp() for scalable text

## Forbidden
- No absolute positioning for layout
- No fixed pixel-based left/top positioning
- No full-width text blocks beyond 1400px

## Testing Requirement
- Must look good at:
  1280px, 1440px, 1920px, 2560px, 3840px
