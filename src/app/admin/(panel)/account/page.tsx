import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { changePassword } from "../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { AdminHeader, Card, CardTitle, Input } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await getSession();
  return (
    <>
      <AdminHeader title="Account" description={`Signed in as ${session?.email}`} />
      <Card className="max-w-lg">
        <CardTitle>Change password</CardTitle>
        <ActionForm action={changePassword} submitLabel="Update password">
          <Input label="Current password" name="current" type="password" required autoComplete="current-password" />
          <Input label="New password" name="next" type="password" required minLength={10} autoComplete="new-password" hint="At least 10 characters." />
          <Input label="Confirm new password" name="confirm" type="password" required autoComplete="new-password" />
        </ActionForm>
      </Card>
    </>
  );
}
