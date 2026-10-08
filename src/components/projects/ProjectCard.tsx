"use client";

import { useState } from "react";
import Image from "next/image";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import type { Project } from "@/data/projects";
import { isInProgress, statusLabel, techFamily } from "@/lib/projects";
import { projectAnchorId } from "@/lib/search/static-entries";

export default function ProjectCard({ project, activeTech }: {
  project: Project;
  activeTech: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = projectAnchorId(project.title);

  return (
    <article id={id} data-search-anchor aria-labelledby={`${id}-title`} className="project-summary-card">
      <div className="project-summary-row">
        <div className="project-summary-image" aria-hidden="true">
          {project.imageUrl ? (
            <Image src={project.imageUrl} alt="" fill sizes="(max-width: 540px) 112px, 240px" className="object-cover object-top" unoptimized />
          ) : (
            <span className="project-summary-monogram">{project.title.slice(0, 2)}</span>
          )}
        </div>
        <div className="project-summary-content">
          <div className="project-summary-heading">
            <div className="project-summary-title">
              <h2 id={`${id}-title`}>{project.title}</h2>
              <span className="project-summary-status">
                <span className={isInProgress(project) ? "is-building" : ""} aria-hidden="true" />
                {statusLabel(project)}
              </span>
            </div>
            <div className="project-summary-actions">
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink aria-hidden="true" />
                  Live demo
                  <span className="sr-only"> for {project.title} (opens in a new tab)</span>
                </a>
              )}
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <FiGithub aria-hidden="true" />
                GitHub
                <span className="sr-only"> for {project.title} (opens in a new tab)</span>
              </a>
            </div>
          </div>
          <p className="project-summary-description" data-expanded={expanded}>{project.description}</p>
          <div className="project-summary-stack">
            {project.techStack.map((tech) => (
              <span key={tech} title={tech} className={`chip${activeTech === techFamily(tech) ? " chip--match" : ""}`}>
                {tech}
              </span>
            ))}
          </div>
          <div className="project-summary-links">
            <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={`${id}-details`}>
              {expanded ? "Less detail" : "Details"} <span aria-hidden="true">{expanded ? "−" : "+"}</span>
            </button>
          </div>
        </div>
      </div>
      <div id={`${id}-details`} className="project-details-reveal" data-expanded={expanded} aria-hidden={!expanded} inert={!expanded}>
        <div className="project-details-clip">
          <div className="project-summary-details">
            <h3>Highlights</h3>
            <ul>{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          </div>
        </div>
      </div>
    </article>
  );
}
