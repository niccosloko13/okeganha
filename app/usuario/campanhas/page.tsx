import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CampanhasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") query.set(key, value);
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/usuario/missoes${suffix}`);
}
