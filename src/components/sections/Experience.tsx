import { experiences } from "@/data/experience";
import Image from "next/image";
import type { IconType } from "react-icons";
import { SiBitbucket, SiDiscord, SiExpress, SiGooglegemini, SiImmer, SiJest, SiJsonwebtokens, SiMongodb, SiNodedotjs, SiPassport, SiRazorpay, SiReact, SiRedux, SiSocketdotio, SiStripe, SiVite } from "react-icons/si";

const technologyIcons: Record<string, IconType> = {
  "Node.js": SiNodedotjs,
  "Express.js": SiExpress,
  "Socket.io": SiSocketdotio,
  MongoDB: SiMongodb,
  React: SiReact,
  Vite: SiVite,
  "RTK Query": SiRedux,
  Razorpay: SiRazorpay,
  Stripe: SiStripe,
  "Passport.js": SiPassport,
  JWT: SiJsonwebtokens,
  Jest: SiJest,
  "Bitbucket Pipelines": SiBitbucket,
  Immer: SiImmer,
  Gemini: SiGooglegemini,
  "Discord API": SiDiscord,
};

const technologyColors: Record<string, string> = {
  "Node.js": "#5FA04E",
  "Express.js": "var(--theme-text-main)",
  "Socket.io": "var(--theme-text-main)",
  MongoDB: "#47A248",
  React: "#61DAFB",
  Vite: "#9135FF",
  "RTK Query": "#764ABC",
  Razorpay: "#0C2451",
  Stripe: "#635BFF",
  "Passport.js": "#34E27A",
  JWT: "#d63aff",
  Jest: "#C21325",
  "Bitbucket Pipelines": "#0052CC",
  Immer: "#00E7C3",
  Gemini: "#8E75B2",
  "Discord API": "#5865F2",
};

export default function Experience() {
  return (
    <section id="experience" className="py-8 px-5 sm:px-8 bg-bg">
      <h2 className="font-semibold text-text-main text-xl mb-5">Work Experience</h2>
      <div className="experience-list">
        {experiences.map((exp) => (
          <details key={`${exp.company}-${exp.period}`} className="experience-entry">
            <summary className="experience-summary">
              <span className="experience-company-mark" aria-hidden="true">
                {exp.logo ? <Image src={exp.logo} alt="" width={36} height={36} className="h-full w-full rounded-full object-contain" /> : exp.company.charAt(0)}
              </span>
              <span className="experience-identity">
                <span className="experience-company">
                  {exp.company}
                  {exp.current && <span className="experience-current">Current</span>}
                </span>
                <span className="experience-role">{exp.role} · {exp.type}</span>
              </span>
              <span className="experience-period">{exp.period}</span>
              <svg className="experience-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
            </summary>
            <div className="experience-details">
              <p>{exp.description}</p>
              <h3 className="experience-detail-heading">Technologies &amp; Tools</h3>
              <ul className="experience-technologies" aria-label={`Technologies used as ${exp.role}`}>
                {exp.technologies.map((technology) => {
                  const Icon = technologyIcons[technology];
                  return (
                    <li key={technology}>
                      {Icon && (
                        <span className={technology === "Razorpay" ? "experience-technology-icon experience-technology-icon--light" : "experience-technology-icon"}>
                          <Icon size={13} color={technologyColors[technology]} aria-hidden="true" />
                        </span>
                      )}
                      {technology}
                    </li>
                  );
                })}
              </ul>
              <h3 className="experience-detail-heading">What I&apos;ve done</h3>
              <ul className="experience-achievements">{exp.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
