import { ContentPage, contentPageMetadata } from "@/components/content-page";

export const generateMetadata = () => contentPageMetadata("terms", "Terms & conditions");

export default function Page() {
  return <ContentPage slug="terms" eyebrow="Legal" showCta={false} />;
}
