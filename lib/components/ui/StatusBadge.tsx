interface StatusBadgeProps {
  label: string;
  color: "green" | "orange" | "blue" | "red" | "gray";
}

const colorMap: Record<StatusBadgeProps["color"], string> = {
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ label, color }: StatusBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colorMap[color]}`}>
      {label}
    </span>
  );
}
