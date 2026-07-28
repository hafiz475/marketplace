import { redirect } from "next/navigation";

export default async function RedirectProducts({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  redirect(`/sites/${company}`);
}
