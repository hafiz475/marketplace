"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiCheck, FiSearch, FiX } from "react-icons/fi";
import { getProfessionals, getProfessionalThemes, setMockProfileIndustry, setMockProfileTheme } from "@/lib/api";
import "./professionals.scss";

type Professional = {
  id: string;
  industryId: string;
  industry: string;
  role: string;
  name: string;
  avatar: string;
  specialty: string;
  color: string;
  wash: string;
};

type ProfessionalTheme = {
  id: string;
  name: string;
  icon: string;
  description: string;
  themeClass: string;
};

export default function ProfessionalsPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [themeProfessional, setThemeProfessional] = useState<Professional | null>(null);
  const [themes, setThemes] = useState<ProfessionalTheme[]>([]);

  useEffect(() => {
    getProfessionals().then(({ professionals }) => setProfessionals(professionals));
  }, []);

  useEffect(() => {
    if (!themeProfessional) return;
    getProfessionalThemes(themeProfessional.industryId).then(({ themes }) => setThemes(themes));
  }, [themeProfessional]);

  const industries = ["All", ...new Set(professionals.map((professional) => professional.industry))];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProfessionals = professionals.filter((professional) =>
    (selectedIndustry === "All" || professional.industry === selectedIndustry) &&
    [professional.name, professional.role, professional.industry, professional.specialty]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <main className="professionals-page">
      <nav className="professionals-nav">
        <Link href="/" className="professionals-brand">Circl<span>Trade</span></Link>
        <Link href="/sites/aerospace" className="store-link">Visit Aerospace store <FiArrowRight /></Link>
      </nav>

      <section className="professionals-hero">
        <p className="eyebrow">Marketplace professionals</p>
        <h1>Choose the expert who fits your world.</h1>
        <p>From restaurant and hospital owners to aviation and renewable-energy leaders, every professional opens the Aerospace marketplace demo.</p>
        <label className="professional-search">
          <FiSearch />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, industries, or specialties" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><FiX /></button>}
        </label>
      </section>

      <section className="professional-directory" aria-label="Professional directory">
        <div className="industry-filters" role="list">
          {industries.map((industry) => (
            <button key={industry} type="button" className={industry === selectedIndustry ? "active" : ""} onClick={() => setSelectedIndustry(industry)}>{industry}</button>
          ))}
        </div>

        <p className="results-count">{visibleProfessionals.length} professionals available</p>
        <div className="professional-grid">
          {visibleProfessionals.map((professional) => (
            <button
              key={professional.id}
              type="button"
              className="professional-card"
              style={{ "--professional-accent": professional.color, "--professional-wash": professional.wash } as CSSProperties}
              onClick={() => setThemeProfessional(professional)}
            >
              <span className="professional-avatar" aria-hidden="true">{professional.avatar}</span>
              <span className="professional-industry">{professional.industry}</span>
              <strong>{professional.role}</strong>
              <span className="professional-name">{professional.name}</span>
              <span className="professional-specialty">{professional.specialty}</span>
              <span className="card-action">Choose 6 themes <FiArrowRight /></span>
            </button>
          ))}
        </div>
      </section>

      {themeProfessional && (
        <div className="theme-picker-backdrop" role="dialog" aria-modal="true" aria-labelledby="theme-picker-title">
          <section className="theme-picker">
            <button type="button" className="theme-picker-close" onClick={() => setThemeProfessional(null)} aria-label="Close theme selection"><FiX /></button>
            <button type="button" className="theme-picker-back" onClick={() => setThemeProfessional(null)}><FiArrowLeft /> Back to professionals</button>
            <p className="eyebrow">{themeProfessional.role}</p>
            <h2 id="theme-picker-title">Choose an atmosphere.</h2>
            <p className="theme-picker-intro">Six light, illustrated storefront looks are available for {themeProfessional.name}. Pick one to enter the Aerospace demo.</p>
            <div className="theme-grid">
              {themes.map((theme) => (
                <button key={theme.id} type="button" className={`theme-option ${theme.themeClass}`} onClick={() => { setMockProfileIndustry(themeProfessional.industryId); setMockProfileTheme(theme.themeClass); router.push("/sites/aerospace"); }}>
                  <span className="theme-orb" aria-hidden="true">{theme.icon}</span>
                  <span className="theme-spark spark-one">✦</span><span className="theme-spark spark-two">✦</span>
                  <strong>{theme.name}</strong>
                  <span>{theme.description}</span>
                  <em>Apply theme <FiCheck /></em>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
