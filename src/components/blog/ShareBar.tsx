"use client";
import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiCopy, FiShare2, FiX } from "react-icons/fi";
import { FaFacebookF, FaLinkedinIn, FaRedditAlien, FaTelegram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { useHydrated } from "@/hooks/useHydrated";
export default function ShareBar({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const id = useId();
  const hydrated = useHydrated();
  const native = hydrated && typeof navigator.share === "function";
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      linkInput.current?.focus();
      linkInput.current?.select();
      setMessage("Select and copy the link above.");
    }
  }

  return (
    <div className="blog-share">
      <button
        type="button"
        className="blog-share-trigger"
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => {
          setMessage("");
          dialog.current?.showModal();
          setOpen(true);
          linkInput.current?.focus();
          linkInput.current?.select();
        }}
      >
        <FiShare2 aria-hidden="true" /> Share
      </button>
      <dialog
        ref={dialog}
        id={id}
        className="blog-share-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right ||
              event.clientY < bounds.top || event.clientY > bounds.bottom)
            dialog.current?.close();
        }}
      >
        <div className="blog-share-dialog-heading">
          <h2 id={`${id}-title`}>Share this article</h2>
          <button
            type="button"
            className="blog-share-close"
            aria-label="Close share dialog"
            onClick={() => dialog.current?.close()}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <p id={`${id}-description`} className="blog-share-description">{title}</p>
        <label htmlFor={`${id}-link`}>Article link</label>
        <div className="blog-share-copy">
          <input
            ref={linkInput}
            id={`${id}-link`}
            type="url"
            value={url}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <button type="button" onClick={copyLink} aria-label="Copy article link">
            {message === "Link copied" ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
          </button>
        </div>
        <p className="blog-share-status" role="status">{message}</p>
        <span className="blog-share-label">Share on</span>
        <div className="blog-share-options">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
          >
            <FaWhatsapp aria-hidden="true" /> WhatsApp
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          >
            <FaTelegram aria-hidden="true" /> Telegram
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          >
            <FaFacebookF aria-hidden="true" /> Facebook
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
          >
            <FaRedditAlien aria-hidden="true" /> Reddit
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          >
            <FaXTwitter aria-hidden="true" /> Twitter / X
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          >
            <FaLinkedinIn aria-hidden="true" /> LinkedIn
          </a>
          {native && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.share({ title, url });
                } catch (error) {
                  if (!(error instanceof Error && error.name === "AbortError"))
                    setMessage("Unable to share. Try Copy link.");
                }
              }}
            >
              <FiShare2 aria-hidden="true" /> More options
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}
