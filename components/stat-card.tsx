export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="glass rounded-3xl p-5 shadow-glow">
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-3 text-2xl font-black text-primary">{value}</p>
    </article>
  );
}
