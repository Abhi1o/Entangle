import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "d1": "var(--font-size-d1)",
        "d2": "var(--font-size-d2)",
        "overl": "var(--font-size-overl)",
        "h1": "var(--font-size-h1)",
        "h2": "var(--font-size-h2)",
        "bodyl": "var(--font-size-bodyl)",
        "bodys": "var(--font-size-bodys)",
        "bodyxs": "var(--font-size-bodyxs)",
        "lblm": "var(--font-size-lblm)",
        "lbll": "var(--font-size-lbll)",
        "titlem": "var(--font-size-titlem)",
        "titlel": "var(--font-size-titlel)",
      },

      textColor: {
        'medium-emphasis': 'hsla(var(--text-color-medium-emphasis))',
        'high-emphasis': 'hsla(var(--text-color-high-emphasis))',
        'persistent-high-emphasis': 'hsla(var(--text-color-persistent-high-emphasis))',
      },

      colors: {

        text: {
          med: "var(--text-med, hsla(0, 0%, 98%, 0.66))",
        },

        action:{
          primary:{
            DEFAULT: "hsl(var(--action-primary-default))",
          }
        },

        accented:{
          text: 'hsla(var(--text-color-accent))',
        },

        surface:{
          level1: "hsla(var(--surface-level-1))",
          level2: "hsl(var(--surface-level-2))",
          level4: "hsl(var(--surface-level-4))",
        },
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          light:"var(--border-light)",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        yellow: {
          500: "#F7B955",
          600: "#E6A84B",
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "md-med": "var(--radius-md-med)",
      },

      backdropBlur: {
        custom: '9px',
      },
      boxShadow: {
        ambient: '0px 8px 20px 0px var(--shadowsambient)',
        penumbra: '0px 6px 60px 0px var(--shadowspenumbra)',
        umbra: '0px 16px 48px 0px var(--shadowsumbra)',
      },

      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
export default config
