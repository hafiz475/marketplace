import { redirect, notFound } from "next/navigation";
const RESERVED_NAMES = [
  "home",
  "maps",
  "search",
  "circltrade",
  "signup",
  "login",
];

export default async function CompanyHome({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;

  if (RESERVED_NAMES.includes(company.toLowerCase())) {
    if (company !== company.toLowerCase()) {
      redirect(`/${company.toLowerCase()}`);
    }
    return notFound();
  }

  redirect(`/sites/${company}`);
}
