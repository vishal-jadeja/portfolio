import { experiences } from "@/data/experience";
import { projects } from "@/data/projects";
import { email } from "@/data/socials";
import {
  GITHUB_AVATAR,
  PERSON,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  knowsAbout,
  sameAs,
} from "@/lib/seo";

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const WEBPAGE_ID = `${SITE_URL}/#webpage`;

const NAV_SECTIONS = [
  { name: "About", hash: "#about" },
  { name: "Work Experience", hash: "#experience" },
  { name: "Projects", hash: "#projects" },
  { name: "Skills", hash: "#skills" },
  { name: "Contributions", hash: "#contributions" },
  { name: "Contact", hash: "#contact" },
];

function buildGraph() {
  const currentRole = experiences.find((e) => e.current) ?? experiences[0];

  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: PERSON.name,
    givenName: PERSON.givenName,
    familyName: PERSON.familyName,
    url: SITE_URL,
    image: GITHUB_AVATAR,
    email: `mailto:${email}`,
    jobTitle: currentRole?.role ?? PERSON.jobTitle,
    description: PERSON.description,
    worksFor: currentRole
      ? { "@type": "Organization", name: currentRole.company }
      : undefined,
    knowsAbout,
    sameAs,
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: `${SITE_NAME} — Portfolio`,
    inLanguage: "en-US",
    publisher: { "@id": PERSON_ID },
  };

  const webpage = {
    "@type": "ProfilePage",
    "@id": WEBPAGE_ID,
    url: SITE_URL,
    name: PERSON.headline,
    description: PERSON.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: GITHUB_AVATAR },
  };

  const projectList = {
    "@type": "ItemList",
    "@id": `${SITE_URL}/#projects`,
    name: `Projects by ${PERSON.name}`,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: project.title,
        description: project.description,
        url: project.live ?? project.github,
        applicationCategory: "WebApplication",
        operatingSystem: "Web",
        image: project.imageUrl ? absoluteUrl(project.imageUrl) : undefined,
        author: { "@id": PERSON_ID },
        keywords: project.techStack.join(", "),
      },
    })),
  };

  const navigation = NAV_SECTIONS.map((section) => ({
    "@type": "SiteNavigationElement",
    name: section.name,
    url: `${SITE_URL}/${section.hash}`,
    isPartOf: { "@id": WEBSITE_ID },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [person, website, webpage, projectList, ...navigation],
  };
}

export default function JsonLd() {
  // Escape `<` so no data value can terminate the script element early.
  const json = JSON.stringify(buildGraph()).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
