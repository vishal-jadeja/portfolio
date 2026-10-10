export interface GearItem {
  name: string;
  detail?: string;
  url: string;
  linkLabel: string;
}

export interface GearGroup {
  id: string;
  title: string;
  items: GearItem[];
}

export const gearGroups: GearGroup[] = [
  {
    id: "hardware",
    title: "Devices & accessories",
    items: [
      { name: "Acer Nitro 5", detail: "Laptop", url: "https://www.flipkart.com/acer-nitro-5-ryzen-hexa-core-5600h-8-gb-1-tb-hdd-256-gb-ssd-windows-10-home-4-graphics-nvidia-geforce-gtx-1650-144-hz-an515-45-an515-45-r712-gaming-laptop/p/itm14dbd8b9892a9", linkLabel: "Flipkart" },
      { name: "Motorola Edge 50", detail: "Mobile", url: "https://www.flipkart.com/motorola-edge-50/p/itm740d86a7c55d1", linkLabel: "Flipkart" },
      { name: "GRENARO wireless microphone", detail: "Wireless microphone", url: "https://www.flipkart.com/grenaro-mic-youtube-noise-reduction-wireless-microphone-mike-vlogging-microphone/p/itm27efc2285b5b4?pid=MICH9SXGGXDTXTGF&lid=LSTMICH9SXGGXDTXTGFXEAF0K&marketplace=FLIPKART", linkLabel: "Flipkart" },
      { name: "MAONO AU-400", detail: "Lavalier omnidirectional microphone · Black", url: "https://www.amazon.in/dp/B07JF9B592", linkLabel: "Amazon" },
      { name: "soundcore Q20i", detail: "Headphones", url: "https://www.amazon.in/dp/B0C3HCD34R", linkLabel: "Amazon" },
      { name: "realme Buds T200 Lite", detail: "Earbuds", url: "https://www.flipkart.com/realme-buds-t200-lite-12-4mm-driver-48hrs-playback-ai-enc-dual-device-pairing-bluetooth/p/itmb4907c52a6c9e?pid=ACCHAFSFYVGEWH5J&lid=LSTACCHAFSFYVGEWH5JJWPXUK&marketplace=HYPERLOCAL", linkLabel: "Flipkart" },
      { name: "Dell mouse", detail: "Mouse", url: "https://www.amazon.in/dp/B01HJI0FS2?ref=ppx_yo2ov_dt_b_fed_asin_title", linkLabel: "Amazon" },
    ],
  },
  {
    id: "software",
    title: "Software",
    items: [
      { name: "Notion", detail: "Notes & planning", url: "https://www.notion.com/", linkLabel: "Website" },
      { name: "Ghostty", detail: "Terminal", url: "https://ghostty.org/", linkLabel: "Website" },
      { name: "DaVinci Resolve Studio", detail: "Video editing", url: "https://www.blackmagicdesign.com/products/davinciresolve/studio", linkLabel: "Website" },
      { name: "OBS Studio", detail: "Recording & streaming", url: "https://obsproject.com/", linkLabel: "Website" },
      { name: "Audacity", detail: "Audio editing", url: "https://www.audacityteam.org/", linkLabel: "Website" },
      { name: "Brave", detail: "Browser", url: "https://brave.com/", linkLabel: "Website" },
    ],
  },
  {
    id: "extensions",
    title: "Web extensions",
    items: [
      { name: "Grammarly", detail: "Writing assistance", url: "https://www.grammarly.com/browser", linkLabel: "Website" },
      { name: "Shazam", detail: "Music recognition", url: "https://www.shazam.com/apps", linkLabel: "Get extension" },
      { name: "Cinova", detail: "My browser extension", url: "https://github.com/vishal-jadeja/cinova", linkLabel: "GitHub" },
      { name: "BuyHatke", detail: "Shopping & price tracking", url: "https://www.buyhatke.com/get-extension", linkLabel: "Get extension" },
      { name: "YouTube playback speed controller", detail: "Playback controls · Chrome Web Store", url: "https://chromewebstore.google.com/search/YouTube%20playback%20speed%20controller", linkLabel: "Browse extensions" },
      { name: "Return YouTube Dislike", detail: "YouTube dislike counts", url: "https://returnyoutubedislike.com/", linkLabel: "Website" },
      { name: "Claude", detail: "Claude in Chrome", url: "https://claude.com/claude-in-chrome", linkLabel: "Get extension" },
      { name: "ChatGPT", detail: "Official web app", url: "https://chatgpt.com/", linkLabel: "Official app" },
      { name: "Dark Reader", detail: "Dark mode for websites", url: "https://darkreader.org/", linkLabel: "Website" },
      { name: "React DevTools", detail: "React inspection", url: "https://react.dev/learn/react-developer-tools", linkLabel: "Get extension" },
      { name: "Redux DevTools", detail: "State debugging", url: "https://github.com/reduxjs/redux-devtools", linkLabel: "GitHub" },
    ],
  },
  {
    id: "ai",
    title: "AI",
    items: [
      { name: "Claude Pro", detail: "AI subscription", url: "https://claude.com/pricing", linkLabel: "View plans" },
      { name: "ChatGPT Go", detail: "AI subscription", url: "https://chatgpt.com/", linkLabel: "Open ChatGPT" },
    ],
  },
  {
    id: "music",
    title: "Music",
    items: [
      { name: "Epidemic Sound", detail: "Music & sound effects", url: "https://share.epidemicsound.com/xiajcd", linkLabel: "Referral link" },
    ],
  },
];
