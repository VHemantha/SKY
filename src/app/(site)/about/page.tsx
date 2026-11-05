import { ContentPage, contentPageMetadata } from "@/components/content-page";

export const generateMetadata = () => contentPageMetadata("about", "About us");

export default function Page() {
  return <ContentPage slug="about" eyebrow="Our story" image="/images/sigiriya.jpg" />;
}
