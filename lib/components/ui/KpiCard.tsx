interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warning?: boolean;
}

export default function KpiCard({ label, value, sub, accent, warning }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p
        className={`text-3xl font-bold ${
          accent ? "text-[#0A2463]" : warning ? "text-orange-500" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
