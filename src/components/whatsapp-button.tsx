import { WhatsAppIcon } from "./social-icons";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppButton({ number }: { number: string }) {
  const href = whatsappLink(number, "Hi Skylantic! I'd like to know more about your Sri Lanka tours.");
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
