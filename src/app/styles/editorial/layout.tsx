import { VariantSwitcher } from "@/components/styles/variant-switcher";

export const metadata = {
  title: "Editorial variant",
};

export default function EditorialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="variant-editorial variant-editorial-paper min-h-dvh">
      <VariantSwitcher />
      {children}
    </div>
  );
}
