// Pemilik: B (Satya). Karakter teman makan versi ilustrasi AI (gambar dari Satya, lihat docs/aset.md).
// Tiga gambar utuh: tersenyum (selalu di bawah), mulut terbuka (meniru mulut anak), merayakan (suapan diterima).
// Tidak ada bagian gambar yang dipotong atau diregangkan.
import "./karakter.css";

const AMBANG_BUKA = 0.25;

export function Teman({ mulut = 0, merayakan = false, className = "" }: { mulut?: number; merayakan?: boolean; className?: string }) {
  const buka = !merayakan && mulut >= AMBANG_BUKA;
  const lapis = (tampil: boolean) => `absolute inset-0 size-full transition-opacity duration-75 ${tampil ? "opacity-100" : "opacity-0"}`;
  return (
    <div className={`relative aspect-square ${className}`}>
      <div key={merayakan ? "rayakan" : "biasa"} className={`absolute inset-0 ${merayakan ? "karakter-lompat" : ""}`}>
        <img src="/aset/karakter/teman-tutup.webp" alt="" width={512} height={512} draggable={false} fetchPriority="high" className="absolute inset-0 size-full" />
        <img src="/aset/karakter/teman-buka.webp" alt="" width={512} height={512} draggable={false} className={lapis(buka)} />
        <img src="/aset/karakter/teman-rayakan.webp" alt="" width={512} height={512} draggable={false} className={lapis(merayakan)} />
      </div>
    </div>
  );
}
