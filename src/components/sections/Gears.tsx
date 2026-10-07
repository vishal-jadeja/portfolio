import { gearGroups } from "@/data/gears";
import type { IconType } from "react-icons";
import { SiReact, SiRedux } from "react-icons/si";
import { TbBrandOpenai, TbCode, TbDeviceLaptop, TbDeviceMobile, TbEar, TbExternalLink, TbHeadphones, TbMicrophone, TbMoon, TbMouse, TbMovie, TbMusic, TbNotes, TbPencil, TbPlayerTrackNext, TbShoppingBag, TbSparkles, TbTerminal2, TbThumbDown, TbVideo, TbWaveSine, TbWorld } from "react-icons/tb";

const gearIcons: Record<string, IconType> = {
  "Acer Nitro 5": TbDeviceLaptop,
  "Motorola Edge 50": TbDeviceMobile,
  "GRENARO wireless microphone": TbMicrophone,
  "MAONO AU-400": TbMicrophone,
  "soundcore Q20i": TbHeadphones,
  "realme Buds T200 Lite": TbEar,
  "Dell mouse": TbMouse,
  Notion: TbNotes,
  Ghostty: TbTerminal2,
  "DaVinci Resolve Studio": TbMovie,
  "OBS Studio": TbVideo,
  Audacity: TbWaveSine,
  Brave: TbWorld,
  Grammarly: TbPencil,
  Shazam: TbMusic,
  Cinova: TbCode,
  BuyHatke: TbShoppingBag,
  "YouTube playback speed controller": TbPlayerTrackNext,
  "Return YouTube Dislike": TbThumbDown,
  Claude: TbSparkles,
  ChatGPT: TbBrandOpenai,
  "Dark Reader": TbMoon,
  "React DevTools": SiReact,
  "Redux DevTools": SiRedux,
  "Claude Pro": TbSparkles,
  "ChatGPT Go": TbBrandOpenai,
  "Epidemic Sound": TbMusic,
};

export default function Gears() {
  return (
    <div className="gears-directory">
      <nav className="gear-category-nav" aria-label="Gear categories">
        {gearGroups.map((group) => (
          <a key={group.id} href={`#${group.id}`}>{group.id === "hardware" ? "Hardware" : group.title}</a>
        ))}
      </nav>
      {gearGroups.map((group) => (
        <section key={group.id} id={group.id} className="gear-group" aria-labelledby={`${group.id}-heading`}>
          <header className="gear-group-header">
            <h2 id={`${group.id}-heading`}>{group.title}</h2>
            <span className="gear-count">{group.items.length} {group.items.length === 1 ? "item" : "items"}</span>
          </header>
          <ul className="gear-items-list">
            {group.items.map((item) => {
              const Icon = gearIcons[item.name] ?? TbCode;
              return (
                <li key={item.name}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="gear-item-row" title={`${item.name}${item.detail ? ` · ${item.detail}` : ""} · ${item.linkLabel} (opens in a new tab)`}>
                    <Icon size={18} aria-hidden="true" className="gear-icon" />
                    <span className="gear-item-name">{item.name}</span>
                    <span className="gear-destination">{item.linkLabel}</span>
                    <TbExternalLink size={12} aria-hidden="true" className="gear-external-icon" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="gear-link-note">Links lead to official sites, support pages, or the listings I shared. The Epidemic Sound link is a referral.</p>
    </div>
  );
}
