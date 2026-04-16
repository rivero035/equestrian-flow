import equioLogo from "@/assets/equio-logo.png";

export function EquioLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <img
          src={equioLogo}
          alt="equio"
          width={48}
          height={48}
          className="animate-equio-swing"
        />
      </div>
    </div>
  );
}
