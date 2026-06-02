export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #040608 0%, #060a0f 50%, #080c14 100%)" }}
    >
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(229,57,53,0.25) 0%, transparent 65%)" }}
        />
        <div className="absolute inset-0 dot-grid-dark opacity-15" />
      </div>

      {/* Phone frame */}
      <div
        className="w-full max-w-md h-[100dvh] sm:h-[880px] sm:rounded-[44px] overflow-hidden relative flex flex-col"
        style={{
          background: "#070b12",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 4px rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: "#080c14" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
