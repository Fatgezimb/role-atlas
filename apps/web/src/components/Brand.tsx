import { Crosshair } from "lucide-react";

export function Brand() {
  return (
    <div className="brand" aria-label="Role Atlas">
      <span className="brand-mark">
        <Crosshair size={20} strokeWidth={2} />
      </span>
      <span>Role Atlas</span>
    </div>
  );
}

