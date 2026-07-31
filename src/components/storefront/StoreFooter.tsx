import React from "react";
import Link from "next/link";
import { IndustryAssets } from "@/lib/industryAssets";

interface StoreFooterProps {
  company: string;
  profile: any;
  assets: IndustryAssets;
  socialKeys: { key: string; id: string }[];
  socialIcons: Record<string, React.ReactNode>;
  getSocialHref: (key: string, val: any) => string;
}

export function StoreFooter({
  company,
  profile,
  assets,
  socialKeys,
  socialIcons,
  getSocialHref,
}: StoreFooterProps) {
  return (
    <footer className="sf-footer">
      <div className="sf-footer-container">
        <div className="sf-footer-col sf-footer-brand">
          <h3>{profile?.company || company}</h3>
          <p>
            Official {assets.label} storefront. Certified products and express global logistics.
          </p>
          <div className="sf-footer-socials">
            {socialKeys.map(({ key, id }) => {
              const val = (profile as any)?.[key];
              const href = getSocialHref(key, val);
              if (!href) return null;
              return (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="sf-footer-social-icon"
                >
                  {socialIcons[id]}
                </a>
              );
            })}
          </div>
        </div>

        <div className="sf-footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><a href="#catalog">Featured Catalog</a></li>
            <li><a href="#contact">Contact Advisor</a></li>
            <li><Link href={`/sites/${company}/cart`}>Shopping Cart</Link></li>
          </ul>
        </div>

        <div className="sf-footer-col">
          <h4>Categories</h4>
          <ul>
            {assets.categories.slice(0, 4).map((c) => (
              <li key={c.name}><span>{c.name}</span></li>
            ))}
          </ul>
        </div>

        <div className="sf-footer-col sf-footer-newsletter">
          <h4>Newsletter</h4>
          <p>Subscribe for exclusive promotional offers and drops.</p>
          <div className="sf-newsletter-input">
            <input type="email" placeholder="Enter your email..." />
            <button className="sf-btn-sub">Join</button>
          </div>
        </div>
      </div>

      <div className="sf-footer-bottom">
        <p>&copy; {new Date().getFullYear()} {profile?.name || company}. All rights reserved.</p>
        <p className="sf-powered">Powered by <Link href="/" className="sf-highlight">CirclTrade Marketplace</Link></p>
      </div>
    </footer>
  );
}
