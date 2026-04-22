/**
 * Decorative right panel for About / Privacy split layouts.
 * Texture from BrandTextureBackdrop + blend into text column.
 */
import { BrandTextureBackdrop } from "@/components/legal/BrandTextureBackdrop";

export function LegalSplitVisual() {
  return (
    <div
      className="relative h-full min-h-[300px] w-full overflow-hidden lg:min-h-[calc(100svh-5.25rem)]"
      aria-hidden
    >
      <BrandTextureBackdrop className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#EEEDEE] from-0% via-[#EEEDEE]/72 via-32% to-transparent to-58%" />
      <div className="pointer-events-none absolute inset-0 z-[3] shadow-[inset_0_0_90px_rgba(22,16,21,0.055),inset_0_0_90px_rgba(235,82,63,0.16),inset_0_0_110px_rgba(170,232,71,0.13)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[4] w-1 rounded-full bg-gradient-to-b from-[#EB523F] via-[#AAE847] to-[#EA3699] opacity-95 shadow-[0_0_22px_rgba(235,82,63,0.62)]" />
    </div>
  );
}
