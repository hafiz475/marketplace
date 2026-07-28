import { redirect } from "next/navigation";

export default async function RedirectProductDetail({
  params,
}: {
  params: Promise<{ company: string; id: string }>;
}) {
  const { company, id } = await params;
  redirect(`/sites/${company}/${id}`);
}
