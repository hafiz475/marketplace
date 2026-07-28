import type { Metadata } from "next";
import { getPublicProductById, getPublicProfile } from "@/lib/api";

type Props = {
  params: Promise<{ company: string; id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: { params: Promise<{ company: string; id: string }> }
): Promise<Metadata> {
  const { company, id } = await params;
  try {
    const [profile, product] = await Promise.all([
      getPublicProfile(company),
      getPublicProductById(company, id)
    ]);
    const storeName = profile?.company || company.toUpperCase();
    const productName = product?.name || "Product Detail";
    return {
      title: `${productName} | ${storeName}`,
      description: product?.description || `View ${productName} at ${storeName}`,
    };
  } catch (error) {
    const storeName = company.charAt(0).toUpperCase() + company.slice(1);
    return {
      title: `Product Detail | ${storeName}`,
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
