import { ContentPage, contentPageMetadata } from "@/components/content-page";

export const generateMetadata = () => contentPageMetadata("privacy", "Privacy policy");

export default function Page() {
  return <ContentPage slug="privacy" eyebrow="Legal" showCta={false} />;
}
