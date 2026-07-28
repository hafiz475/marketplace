"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowRight, FiSearch, FiX } from "react-icons/fi";
import { getProfessionals } from "@/lib/api";
import "./professionals.scss";

type Professional = {
  id: string;
  industryId: string;
  industry: string;
  role: string;
  name: string;
  avatar: string;
  specialty: string;
};

export default function ProfessionalsPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  useEffect(() => {
    getProfessionals().then(({ professionals }) => setProfessionals(professionals));
  }, []);

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
            <button key={professional.id} type="button" className="professional-card" onClick={() => router.push("/sites/aerospace")}>
              <span className="professional-avatar" aria-hidden="true">{professional.avatar}</span>
              <span className="professional-industry">{professional.industry}</span>
              <strong>{professional.role}</strong>
              <span className="professional-name">{professional.name}</span>
              <span className="professional-specialty">{professional.specialty}</span>
              <span className="card-action">Select professional <FiArrowRight /></span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
