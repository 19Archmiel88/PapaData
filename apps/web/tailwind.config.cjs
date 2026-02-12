/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],

  /*
   * SAFELIST
   * ───────────────────────────────────────────
   * klasy generowane dynamicznie (np. z CSS vars)
   */
  safelist: [
    {
      pattern: /z-\(.+\)/,
    },
    {
      pattern: /pd-.+/,
    },
  ],

  theme: {
    /*
     * BREAKPOINTS
     * ───────────────────────────────────────────
     * mobile-first + orientation aware
     */
    screens: {
      xs: "360px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      portrait: { raw: "(orientation: portrait)" },
      landscape: { raw: "(orientation: landscape)" },
    },

    /*
     * CONTAINER
     * ───────────────────────────────────────────
     * spójne z --pd-container-px
     */
    container: {
      center: true,
      padding: {
        DEFAULT: "24px",
        sm: "24px",
        md: "24px",
        lg: "32px",
        xl: "32px",
      },
      screens: {
        xl: "1200px",
        "2xl": "1280px",
      },
    },

    extend: {
      /*
       * TYPOGRAPHY
       * ───────────────────────────────────────────
       */
      fontFamily: {
        sans: [
          "Manrope",
          "Space Grotesk",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Space Grotesk",
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "IBM Plex Mono",
          "JetBrains Mono",
          "Consolas",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },

      fontSize: {
        body: ["0.9375rem", { lineHeight: "1.6" }], // 15px
        label: ["0.8125rem", { lineHeight: "1.4" }], // 13px
        meta: [
          "0.75rem",
          {
            lineHeight: "1.3",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          },
        ],
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
        "3xs": ["0.625rem", { lineHeight: "1rem" }],
      },

      /*
       * RADII — enterprise softness
       */
      borderRadius: {
        card: "18px",
        control: "14px",
        modal: "24px",
      },

      /*
       * SHADOWS — cinematic depth
       */
      boxShadow: {
        card: "0 16px 50px -28px rgba(0,0,0,0.35)",
        "card-light": "0 18px 55px -35px rgba(31,38,135,0.18)",
        overlay: "0 28px 120px -60px rgba(0,0,0,0.75)",
      },

      /*
       * Z-INDEX — aligned with CSS tokens
       */
      zIndex: {
        surface: "10",
        content: "20",
        nav: "100",
        modal: "900",
        overlay: "1000",
        floating: "2000",
      },

      /*
       * TRANSITIONS / MOTION
       */
      transitionTimingFunction: {
        "out-cubic": "cubic-bezier(0.33, 1, 0.68, 1)",
        "in-cubic": "cubic-bezier(0.32, 0, 0.67, 0)",
      },

      transitionDuration: {
        fast: "160ms",
        base: "220ms",
        slow: "360ms",
      },
    },
  },

  /*
   * CORE PLUGINS
   * ───────────────────────────────────────────
   * nic nie wyłączamy — UI cinematic korzysta szeroko
   */
  corePlugins: {
    preflight: true,
  },

  plugins: [],
};
