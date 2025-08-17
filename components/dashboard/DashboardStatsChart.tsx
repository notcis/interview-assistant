import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardStatsChart({
  stats,
}: {
  stats: {
    date: string;
    totalInterviews: number;
    completedQuestions: number;
    unansweredQuestions: number;
    completionRate: number;
  }[];
}) {
  const sortedStats = stats
    ?.slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedStats}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          label={{ value: "Date", position: "insideBottom", offset: -5 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="totalInterviews"
          fill="#8884d8"
          name={"Total Interviews"}
        />
        <Bar
          dataKey="completedQuestions"
          fill="#ffc658"
          name={"Completed Questions"}
        />
        <Bar
          dataKey="unansweredQuestions"
          fill="#82ca9d"
          name={"Unanswered Questions"}
        />
        <Bar
          dataKey="completionRate"
          fill="#ff7300"
          name={"Completion Rate %"}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
