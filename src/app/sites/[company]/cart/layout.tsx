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
      title: `Cart | ${storeName}`,
      description: `View your shopping cart at ${storeName}`,
    };
  } catch (error) {
    const storeName = company.charAt(0).toUpperCase() + company.slice(1);
    return {
      title: `Cart | ${storeName}`,
    };
  }
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
