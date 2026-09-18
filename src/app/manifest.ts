import type { MetadataRoute } from "next";
import { PERSON, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${PERSON.jobTitle}`,
    short_name: SITE_NAME,
    description: PERSON.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
