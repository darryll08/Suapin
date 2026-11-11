// Pemilik: B (Satya). Ilustrasi anak (gambar AI dari Satya, lihat docs/aset.md).
// Dua gambar utuh: mulut tertutup (anak-senyum) dan mulut terbuka (anak-buka), ditukar sesuai bukaan mulut.
// Tidak ada mulut yang dipotong atau diregangkan, supaya bentuk mulut tetap seperti gambar aslinya.

const AMBANG_BUKA = 0.25;

export function Anak({ mulut = 0, className = "" }: { mulut?: number; className?: string }) {
  const buka = mulut >= AMBANG_BUKA;
  return (
    <div className={`relative aspect-square ${className}`}>
      <img src="/aset/anak/anak-senyum.webp" alt="" width={512} height={512} draggable={false} fetchPriority="high"
        className="absolute inset-0 size-full" />
      <img src="/aset/anak/anak-buka.webp" alt="" width={512} height={512} draggable={false}
        className={`absolute inset-0 size-full transition-opacity duration-75 ${buka ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
