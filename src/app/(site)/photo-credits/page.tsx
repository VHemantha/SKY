import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Photo credits",
  robots: { index: false, follow: true },
};

// Placeholder photos from Wikimedia Commons. Remove entries as you replace
// them with your own photography.
const CREDITS = [
  { file: "yala-leopard.jpg", author: "AdrianRanasinghe", license: "CC BY-SA 4.0", source: "File:Srilankan_leopard_in_Yala_National_Park_1.jpg" },
  { file: "minneriya-gathering.jpg", author: "Walter Gehr", license: "CC BY-SA 4.0", source: "File:Minneriya_National_Park,_elephants_gathering.jpg" },
  { file: "udawalawe-elephants.jpg", author: "Z thomas", license: "CC BY-SA 4.0", source: "File:Udawalawe_Elephant_Transit_Home_2017-10-27_(8).jpg" },
  { file: "wilpattu-sambar.jpg", author: "Manelka Jayasundara", license: "CC BY-SA 4.0", source: "File:Sambar_Deer_at_Wilpattu_National_Park.jpg" },
  { file: "kumana.jpg", author: "Dr.S.Rajivraja", license: "CC BY-SA 4.0", source: "File:Kumana_National_Park.jpg" },
  { file: "bundala.jpg", author: "A.Savin", license: "Free Art License", source: "File:SL_Bundala_NP_asv2020-01_img08.jpg" },
  { file: "horton-plains.jpg", author: "A.Savin", license: "Free Art License", source: "File:SL_Horton_Plains_NP_asv2020-01_img08.jpg" },
  { file: "yala-jeep.jpg", author: "Dan arndt", license: "CC BY-SA 4.0", source: "File:Safari_-_Yala_NP.jpg" },
  { file: "yala-jeeps.jpg", author: "Balou46", license: "CC BY-SA 3.0", source: "File:LK-yala-jeeps.jpg" },
  { file: "sigiriya.jpg", author: "Yourusernamewillbepublic2", license: "CC0", source: "File:Sigiriya_rock_from_a_distance.jpg" },
  { file: "ella-nine-arch.jpg", author: "Dr.S.Rajivraja", license: "CC BY-SA 4.0", source: "File:Nine_Arch_Bridge,_Demodara_Ella.jpg" },
  { file: "tea-nuwara-eliya.jpg", author: "Vyacheslav Argenberg", license: "CC BY 4.0", source: "File:Sri_Lanka,_Tea_plantations,_Nuwara_Eliya.jpg" },
  { file: "mirissa.jpg", author: "Thedani Karasnagoda", license: "CC BY-SA 4.0", source: "File:Mirissa_sea_1.jpg" },
  { file: "galle-fort.jpg", author: "A.Savin", license: "Free Art License", source: "File:SL_Galle_Fort_asv2020-01_img02.jpg" },
];

export default function PhotoCreditsPage() {
  return (
    <>
      <PageHero eyebrow="Credits" title="Photo credits" crumbs={[{ href: "/photo-credits", label: "Photo credits" }]} />
      <section className="py-14 sm:py-20">
        <div className="container-x max-w-3xl">
          <p className="text-ink/70">
            Some photographs on this website are used under free licences from Wikimedia Commons. We thank the photographers below.
          </p>
          <ul className="mt-8 divide-y divide-sand-200 rounded-3xl bg-white px-6 ring-1 ring-sand-200">
            {CREDITS.map((c) => (
              <li key={c.file} className="py-4 text-sm">
                <a
                  href={`https://commons.wikimedia.org/wiki/${encodeURI(c.source)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-jungle-800 underline-offset-4 hover:underline"
                >
                  {c.source.replace("File:", "").replace(/_/g, " ")}
                </a>
                <span className="block text-ink/60">
                  {c.author} · {c.license}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
