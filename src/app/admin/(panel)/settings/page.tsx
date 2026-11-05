import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { saveSettings } from "../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { ImageField } from "@/components/admin/image-field";
import { AdminHeader, Card, CardTitle, Input, Textarea } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <>
      <AdminHeader title="Site settings" description="Contact details, social links and the home page hero." />
      <ActionForm action={saveSettings} submitLabel="Save settings">
        <Card>
          <CardTitle>Business</CardTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Business name" name="siteName" required defaultValue={s.siteName} />
            <Input label="Tagline" name="tagline" defaultValue={s.tagline} />
            <Textarea
              label="Credentials & licences"
              name="credentials"
              rows={2}
              defaultValue={s.credentials}
              className="sm:col-span-2"
              hint="e.g. “Registered with the Sri Lanka Tourism Development Authority (SLTDA), Reg. No. …”. Shown in the footer."
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Contact</CardTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Phone" name="phone" defaultValue={s.phone} placeholder="+94 77 123 4567" />
            <Input label="WhatsApp number" name="whatsapp" defaultValue={s.whatsapp} placeholder="+94 77 123 4567" hint="Include country code. Enables the WhatsApp button." />
            <Input label="Email" name="email" type="email" defaultValue={s.email} placeholder="hello@skylantic.lk" />
            <Textarea label="Address" name="address" rows={2} defaultValue={s.address} />
          </div>
        </Card>
        <Card>
          <CardTitle>Social media</CardTitle>
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="Facebook URL" name="facebook" type="url" defaultValue={s.facebook} placeholder="https://facebook.com/…" />
            <Input label="Instagram URL" name="instagram" type="url" defaultValue={s.instagram} placeholder="https://instagram.com/…" />
            <Input label="Tripadvisor URL" name="tripadvisor" type="url" defaultValue={s.tripadvisor} placeholder="https://tripadvisor.com/…" />
          </div>
        </Card>
        <Card>
          <CardTitle>Home page hero</CardTitle>
          <div className="grid gap-5">
            <Input label="Headline" name="heroTitle" required defaultValue={s.heroTitle} />
            <Textarea label="Sub-headline" name="heroSubtitle" rows={2} defaultValue={s.heroSubtitle} />
            <ImageField name="heroImage" label="Hero photo" defaultValue={s.heroImage} hint="A wide, high-quality landscape photo (at least 1920px wide)." />
          </div>
        </Card>
      </ActionForm>
    </>
  );
}
