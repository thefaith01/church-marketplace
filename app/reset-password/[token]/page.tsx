import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default async function ResetWithTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
