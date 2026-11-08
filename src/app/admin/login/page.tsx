import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.meta.adminSignIn,
    robots: { index: false, follow: false },
  };
}

export default function AdminLoginPage() {
  return <LoginForm />;
}
