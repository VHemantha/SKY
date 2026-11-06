import Link from "next/link";
import type { Destination } from "@/lib/content";
import { saveDestination } from "../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { ImageField } from "@/components/admin/image-field";
import { Card, CardTitle, Input, Textarea, Toggle } from "@/components/admin/ui";

export function DestinationForm({ destination: d }: { destination?: Destination }) {
  return (
    <ActionForm
      action={saveDestination}
      submitLabel={d ? "Save changes" : "Create destination"}
      footer={<Link href="/admin/destinations" className="btn px-4 text-ink/60 hover:bg-sand-100">Cancel</Link>}
    >
      {d && <input type="hidden" name="id" value={d.id} />}
      <Card>
        <CardTitle>Details</CardTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Name" name="name" required defaultValue={d?.name} placeholder="e.g. Yala National Park" />
          <Input label="Region" name="region" defaultValue={d?.region} placeholder="e.g. Southern Province" />
          <Textarea label="Short description" name="summary" required rows={2} defaultValue={d?.summary} className="sm:col-span-2" hint="Shown on cards and in Google results." />
          <Textarea label="Full description" name="description" rows={8} defaultValue={d?.description} className="sm:col-span-2" hint="Leave a blank line between paragraphs." />
          <Textarea label="Wildlife & highlights" name="highlights" rows={5} defaultValue={d?.highlights} hint="One per line." />
          <Textarea label="Best time to visit" name="bestTime" rows={5} defaultValue={d?.bestTime} />
        </div>
      </Card>
      <Card>
        <CardTitle>Photo</CardTitle>
        <ImageField name="image" label="Main photo" defaultValue={d?.image} />
      </Card>
      <Card>
        <CardTitle>Visibility</CardTitle>
        <div className="grid gap-5 sm:grid-cols-3">
          <Toggle label="Published" name="published" defaultChecked={d?.published ?? true} />
          <Input label="URL slug" name="slug" defaultValue={d?.slug} hint="Leave empty to create from the name." />
          <Input label="Sort order" name="sortOrder" type="number" defaultValue={d?.sortOrder ?? 0} />
        </div>
      </Card>
    </ActionForm>
  );
}
