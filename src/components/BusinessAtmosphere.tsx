import "./BusinessAtmosphere.scss";

const companionIcons: Record<string, string[]> = {
  automotive: ["🔧", "🛞", "⚙️"],
  food: ["🍽️", "🌿", "✨"],
  healthcare: ["💊", "🩺", "✚"],
  hospitality: ["🛎️", "🗝️", "✦"],
  technology: ["⌘", "◈", "✦"],
  aerospace: ["🛰️", "☄️", "✦"],
  education: ["📚", "✎", "✦"],
  agriculture: ["🌱", "☀️", "✦"],
  retail: ["🛍️", "✦", "◌"],
};

export default function BusinessAtmosphere({ industry, icon }: { industry?: string; icon?: string }) {
  const icons = companionIcons[industry || ""] || ["✦", "◌", "◇"];
  return (
    <div className="business-atmosphere" aria-hidden="true">
      <span className="business-orb orb-one">{icon || "✨"}</span>
      <span className="business-orb orb-two">{icons[0]}</span>
      <span className="business-orb orb-three">{icons[1]}</span>
      <span className="business-orb orb-four">{icons[2]}</span>
    </div>
  );
}
