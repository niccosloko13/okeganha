export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="ok-blob h-52 w-52 bg-[#ff8ecf]/70" style={{ top: "6%", left: "-5%" }} />
      <span className="ok-blob h-64 w-64 bg-[#cc8cff]/60" style={{ top: "24%", right: "-7%", animationDelay: "0.8s" }} />
      <span className="ok-blob h-56 w-56 bg-[#ffb0dd]/55" style={{ bottom: "12%", left: "12%", animationDelay: "1.4s" }} />
      <span className="ok-blob h-72 w-72 bg-[#b774ff]/45" style={{ bottom: "-8%", right: "10%", animationDelay: "2s" }} />
    </div>
  );
}
