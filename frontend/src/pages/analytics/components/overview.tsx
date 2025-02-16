import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  {
    date: "Jan 1",
    logs: 2400,
    errors: 240,
  },
  {
    date: "Jan 2",
    logs: 1398,
    errors: 139,
  },
  {
    date: "Jan 3",
    logs: 9800,
    errors: 980,
  },
  {
    date: "Jan 4",
    logs: 3908,
    errors: 390,
  },
  {
    date: "Jan 5",
    logs: 4800,
    errors: 480,
  },
  {
    date: "Jan 6",
    logs: 3800,
    errors: 380,
  },
  {
    date: "Jan 7",
    logs: 4300,
    errors: 430,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
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
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="errors"
          stroke="#82ca9d"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
