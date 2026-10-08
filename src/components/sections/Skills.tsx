"use client";

import type { IconType } from "react-icons";
import {
  SiJavascript, SiTypescript, SiPython, SiCplusplus,
  SiReact, SiNextdotjs, SiRedux, SiVite,
  SiNodedotjs, SiExpress, SiMongodb, SiMysql, SiPostgresql,
  SiGit, SiBitbucket, SiJest, SiSocketdotio, SiPassport,
  SiJsonwebtokens,
} from "react-icons/si";
import { motion } from "framer-motion";
import { skillCategories } from "@/data/skills";

const SKILL_ICONS: Record<string, IconType> = {
  "JavaScript":       SiJavascript,
  "TypeScript":       SiTypescript,
  "Python":           SiPython,
  "C++":              SiCplusplus,
  "React.js":         SiReact,
  "Next.js":          SiNextdotjs,
  "Redux Toolkit":    SiRedux,
  "RTK Query":        SiRedux,
  "Vite":             SiVite,
  "Node.js":          SiNodedotjs,
  "Express.js":       SiExpress,
  "WebSockets":       SiSocketdotio,
  "JWT":              SiJsonwebtokens,
  "Passport.js":      SiPassport,
  "MongoDB":          SiMongodb,
  "MySQL":            SiMysql,
  "SQL Server":       SiPostgresql,
  "Git":              SiGit,
  "Bitbucket CI/CD":  SiBitbucket,
  "Jest":             SiJest,
};

const SKILL_COLORS: Record<string, string> = {
  "JavaScript":       "#F7DF1E",
  "TypeScript":       "#3178C6",
  "Python":           "#3776AB",
  "C++":              "#00599C",
  "React.js":         "#61DAFB",
  "Redux Toolkit":    "#764ABC",
  "RTK Query":        "#764ABC",
  "Vite":             "#646CFF",
  "Node.js":          "#339933",
  "Passport.js":      "#34E27A",
  "MongoDB":          "#47A248",
  "MySQL":            "#4479A1",
  "SQL Server":       "#336791",
  "Git":              "#F05032",
  "Bitbucket CI/CD":  "#0052CC",
  "Jest":             "#C21325",
  "JWT":              "#d63aff",
};

export default function Skills() {
  return (
    <section id="skills" className="py-8 site-gutter bg-bg">
      <div className="max-w-[840px] mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="section-title section-title-spaced"
        >
          Skills
        </motion.h2>

        <div className="flex flex-col gap-7">
          {skillCategories.map((cat, ci) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: ci * 0.06 }}
            >
              <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mb-2.5">
                {cat.title}
              </p>

              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => {
                  const Icon = SKILL_ICONS[skill];
                  return (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="chip cursor-default inline-flex items-center gap-1.5"
                    >
                      {Icon && <Icon size={13} color={SKILL_COLORS[skill]} />}
                      {skill}
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
