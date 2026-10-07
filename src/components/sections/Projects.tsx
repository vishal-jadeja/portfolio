"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HOME_PROJECT_COUNT, projects } from "@/data/projects";
import { projectAnchorId } from "@/lib/search/static-entries";

export default function Projects() {
  return (
    <section id="projects" className="py-8 px-5 sm:px-8 bg-bg">
      <div className="max-w-[840px] mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="font-bold text-text-main text-2xl mb-8"
        >
          Projects
        </motion.h2>

        {/* Project cards */}
        <div className="flex flex-col gap-4">
          {projects.slice(0, HOME_PROJECT_COUNT).map((project, i) => (
            <motion.div
              key={project.title}
              id={projectAnchorId(project.title)}
              data-search-anchor
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group flex flex-col sm:flex-row gap-6 py-4 hover:-mx-4 hover:px-4 hover:bg-[var(--glass-bg)] rounded-2xl transition-all duration-300"
            >
              {/* Image — left side */}
              <div className="relative w-full sm:w-[240px] md:w-[280px] h-48 sm:h-auto shrink-0 bg-[var(--theme-surface)] rounded-xl overflow-hidden border border-[var(--glass-border)]">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={`${project.title} screenshot`}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 340px"
                    unoptimized
                  />
                ) : (
                  /* Gradient placeholder when no image */
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-surface)] via-[var(--theme-card)] to-[var(--theme-border-main)] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted opacity-20">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content — right side */}
              <div className="flex-1 flex flex-col justify-between py-1 gap-4">
                {/* Top: title + buttons */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h3 className="font-bold text-text-main text-2xl leading-tight">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-main hover:bg-[rgba(255,255,255,0.05)] rounded-full px-3 py-1.5 transition-all duration-150"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                        Live
                      </a>
                    )}
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-main hover:bg-[rgba(255,255,255,0.05)] rounded-full px-3 py-1.5 transition-all duration-150"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-muted text-sm leading-relaxed flex-1 line-clamp-2">
                  {project.description}
                </p>

                {/* Tech chips */}
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <motion.span
                      key={tech}
                      className="chip"
                      whileHover={{ scale: 1.05, y: -1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-4 mt-10"
        >
          <Link href="/projects" className="modern-btn-outline px-8">
            View all {projects.length} projects
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="https://github.com/vishal-jadeja"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-sm font-medium text-text-muted hover:text-text-main transition-colors"
          >
            GitHub profile ↗
          </a>
        </motion.div>
      </div>
    </section>
  );
}
