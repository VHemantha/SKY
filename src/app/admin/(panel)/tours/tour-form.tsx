import Link from "next/link";
import type { Destination, Tour } from "@/lib/content";
import { CURRENCIES, PRICE_BASIS, TOUR_TYPES } from "@/lib/constants";
import { parseGallery } from "@/lib/utils";
import { saveTour } from "../../actions";
import { ActionForm } from "@/components/admin/action-form";
import { GalleryField, ImageField } from "@/components/admin/image-field";
import { Card, CardTitle, Input, Select, Textarea, Toggle } from "@/components/admin/ui";

type Props = {
  tour?: Tour;
  destinations: Pick<Destination, "id" | "name">[];
};

export function TourForm({ tour, destinations }: Props) {
  const selected = new Set(tour?.destinationIds);
  return (
    <ActionForm
      action={saveTour}
      submitLabel={tour ? "Save changes" : "Create tour"}
      footer={<Link href="/admin/tours" className="btn px-4 text-ink/60 hover:bg-sand-100">Cancel</Link>}
    >
      {tour && <input type="hidden" name="id" value={tour.id} />}

      <Card>
        <CardTitle>Basics</CardTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Tour name" name="title" required defaultValue={tour?.title} className="sm:col-span-2" placeholder="e.g. Yala Leopard Safari — Full Day" />
          <Select label="Type" name="type" options={TOUR_TYPES} defaultValue={tour?.type ?? "DAY_SAFARI"} />
          <Input label="Duration" name="duration" required defaultValue={tour?.duration} placeholder="e.g. 6 hours, or 2 days / 1 night" />
          <Textarea label="Short description" name="summary" required rows={2} defaultValue={tour?.summary} className="sm:col-span-2" hint="One or two sentences shown on tour cards and in Google results." />
          <Textarea label="Full description" name="description" required rows={8} defaultValue={tour?.description} className="sm:col-span-2" hint="Leave a blank line between paragraphs." />
        </div>
      </Card>

      <Card>
        <CardTitle>National park(s) covered</CardTitle>
        {destinations.length === 0 ? (
          <p className="text-sm text-ink/60">
            No destinations yet. <Link href="/admin/destinations/new" className="text-jungle-700 underline">Add one first</Link>.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            {destinations.map((d) => (
              <label key={d.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-sand-200 px-4 py-3 text-sm has-[:checked]:border-jungle-500 has-[:checked]:bg-jungle-50">
                <input type="checkbox" name="destinationIds" value={d.id} defaultChecked={selected.has(d.id)} className="h-4 w-4 accent-jungle-600" />
                {d.name}
              </label>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Price & group size</CardTitle>
        <div className="grid gap-5 sm:grid-cols-4">
          <Input label="Price (from)" name="price" type="number" min={0} step="0.01" defaultValue={tour?.price ?? ""} hint="Leave empty for “price on request”." />
          <Select label="Currency" name="currency" options={Object.fromEntries(CURRENCIES.map((c) => [c, c]))} defaultValue={tour?.currency ?? "USD"} />
          <Select label="Price is" name="priceBasis" options={PRICE_BASIS} defaultValue={tour?.priceBasis ?? "PER_PERSON"} />
          <Input label="Max group size" name="maxGroupSize" type="number" min={1} defaultValue={tour?.maxGroupSize ?? ""} />
        </div>
      </Card>

      <Card>
        <CardTitle>Details</CardTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Textarea label="Highlights" name="highlights" rows={5} defaultValue={tour?.highlights} hint="One per line." className="sm:col-span-2" />
          <Textarea label="Included" name="included" rows={6} defaultValue={tour?.included} hint="One item per line." />
          <Textarea label="Not included" name="excluded" rows={6} defaultValue={tour?.excluded} hint="One item per line." />
          <Textarea
            label="Itinerary"
            name="itinerary"
            rows={7}
            defaultValue={tour?.itinerary}
            className="sm:col-span-2"
            hint="One step per line. Use “::” to add details, e.g.  5:00 am — Hotel pickup :: We collect you from your hotel in Tissamaharama."
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Photos & video</CardTitle>
        <div className="space-y-8">
          <ImageField name="coverImage" label="Cover photo" defaultValue={tour?.coverImage} />
          <GalleryField name="gallery" label="Gallery" defaultValue={parseGallery(tour?.gallery)} />
          <Input label="Video link (YouTube or Vimeo)" name="videoUrl" type="url" defaultValue={tour?.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=…" />
        </div>
      </Card>

      <Card>
        <CardTitle>Visibility & SEO</CardTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Toggle label="Published" name="published" defaultChecked={tour?.published ?? true} hint="Visible on the website." />
          <Toggle label="Featured" name="featured" defaultChecked={tour?.featured ?? false} hint="Shown first and on the home page." />
          <Input label="URL slug" name="slug" defaultValue={tour?.slug} hint="Leave empty to create from the tour name." placeholder="yala-leopard-safari" />
          <Input label="Sort order" name="sortOrder" type="number" defaultValue={tour?.sortOrder ?? 0} hint="Lower numbers appear first." />
          <Input label="SEO title" name="metaTitle" maxLength={70} defaultValue={tour?.metaTitle ?? ""} hint="Optional. Up to 70 characters." />
          <Input label="SEO description" name="metaDescription" maxLength={170} defaultValue={tour?.metaDescription ?? ""} hint="Optional. Up to 170 characters." />
        </div>
      </Card>
    </ActionForm>
  );
}
