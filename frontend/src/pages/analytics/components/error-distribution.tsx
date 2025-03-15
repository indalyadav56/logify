import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "500 Internal Server", value: 400, color: "#FF6B6B" },
  { name: "404 Not Found", value: 300, color: "#4ECDC4" },
  { name: "403 Forbidden", value: 200, color: "#45B7D1" },
  { name: "401 Unauthorized", value: 150, color: "#96CEB4" },
  { name: "Other", value: 100, color: "#FFEEAD" },
];

export function ErrorDistribution() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
