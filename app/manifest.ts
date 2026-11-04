import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apna Kaam",
    short_name: "Apna Kaam",
    description: "Ghar ki har zarurat, ek hi app par.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#15803d",
    lang: "hi-IN",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
