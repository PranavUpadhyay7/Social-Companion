# Theme

## Compact token summary

- Framework: Next.js 15 App Router, React 19
- Styling: Tailwind CSS 4 utilities with minimal global CSS
- Font: Geist sans (`--font-geist-sans`), Geist Mono (`--font-geist-mono`)
- Core colors: black `#000000`, near-black `#101010`, white `#ffffff`, zinc borders (`zinc-700`/`zinc-800`), muted gray body text, violet accent `#a95bf4`
- Typography: large uppercase landing headings, bold weights, wide letter spacing; small clean gray supporting copy
- Radius: compact `rounded-md` for controls/cards and circles for avatar controls
- Effects: restrained violet glow `0 0 6px #a95bf4, 0 0 10px #a95bf4`; animated white/violet ray background
- Layout: generous responsive whitespace; max-width content around 1540px
- Breakpoints: Tailwind defaults (`sm`, `md`, `lg`, `xl`)

## Raw source

### `app/globals.css`

```css
@import "tailwindcss";

body{
background-color:black;
}
```

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

