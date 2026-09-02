import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // osu!'s signature pink, used across ppy.sh branding.
        osupink: "#ff66ab",
      },
    },
  },
  plugins: [],
};

export default config;
