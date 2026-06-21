import logo from "@/assets/wellai-logo.png";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <img
      src={logo}
      width={size}
      height={size}
      alt="WellAI logo"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-display text-xl font-bold tracking-tight">WelIAI</span>
    </div>
  );
}
