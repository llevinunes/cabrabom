import Image from "next/image";
import Link from "next/link";

// Logo signature from the design guide (section 2.7): icon + "Cabra" in blue and "Bom" in text orange.
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="CabraBom, ir para o início">
      <Image src="/logo.svg" alt="" width={40} height={40} priority />
      {!compact && (
        <span className="text-[22px] font-black tracking-[-0.02em]">
          Cabra<span className="text-laranja-texto">Bom</span>
        </span>
      )}
    </Link>
  );
}
