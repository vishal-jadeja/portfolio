import type { IconType } from "react-icons";
import { TbBrandGithub, TbBrandInstagram, TbBrandLeetcode, TbBrandLinkedin, TbBrandX, TbBrandYoutube, TbLink, TbMail } from "react-icons/tb";

const icons: Record<string, IconType> = {
  X: TbBrandX,
  Instagram: TbBrandInstagram,
  YouTube: TbBrandYoutube,
  Email: TbMail,
  LinkedIn: TbBrandLinkedin,
  GitHub: TbBrandGithub,
  LeetCode: TbBrandLeetcode,
};

export default function SocialIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = icons[name] ?? TbLink;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}
