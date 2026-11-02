import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CabraBom",
    short_name: "CabraBom",
    description: "Mão de obra de confiança, perto de você.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    theme_color: "#14233C",
    background_color: "#F6F3EC",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
