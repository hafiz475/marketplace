import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/api";

type Props = {
  params: Promise<{ company: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: { params: Promise<{ company: string }> }
): Promise<Metadata> {
  const company = (await params).company;
  try {
    const profile = await getPublicProfile(company);
    const storeName = profile?.company || company.toUpperCase();
    return {
      title: `${storeName} - Catalog`,
      description: `Browse products and services from ${storeName}`,
    };
  } catch (error) {
    const storeName = company.charAt(0).toUpperCase() + company.slice(1);
    return {
      title: `${storeName} - Catalog`,
      description: `Browse products and services from ${storeName}`,
    };
  }
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
