import type { ReactNode } from "react";

export default function BlogTemplate({ children }: { children: ReactNode }) {
  return <div className="blog-route-enter">{children}</div>;
}
