import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  {
    time: "00:00",
    logs: 245,
    errors: 3,
  },
  {
    time: "04:00",
    logs: 388,
    errors: 5,
  },
  {
    time: "08:00",
    logs: 980,
    errors: 12,
  },
  {
    time: "12:00",
    logs: 1520,
    errors: 8,
  },
  {
    time: "16:00",
    logs: 1200,
    errors: 7,
  },
  {
    time: "20:00",
    logs: 850,
    errors: 4,
  },
  {
    time: "24:00",
    logs: 456,
    errors: 2,
  },
];

export function LogTrends() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="time"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="logs"
          stroke="#0ea5e9"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="errors"
          stroke="#ef4444"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
