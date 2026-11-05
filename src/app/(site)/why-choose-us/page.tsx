import { ContentPage, contentPageMetadata } from "@/components/content-page";

export const generateMetadata = () => contentPageMetadata("why-choose-us", "Why choose us");

export default function Page() {
  return <ContentPage slug="why-choose-us" eyebrow="Why Skylantic" image="/images/yala-jeep.jpg" />;
}
