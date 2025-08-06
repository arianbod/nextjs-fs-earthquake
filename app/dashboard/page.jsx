import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const metrics = [
  { title: "Total Assessments", value: 120 },
  { title: "Pending Reviews", value: 15 },
  { title: "Completed Reports", value: 80 },
  { title: "Average Score", value: "B+" },
];

const recentAssessments = [
  { id: 1, building: "Building A", date: "2024-05-01", status: "Completed" },
  { id: 2, building: "Building B", date: "2024-05-03", status: "In Progress" },
  { id: 3, building: "Building C", date: "2024-05-05", status: "Pending" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader>
              <CardTitle>{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">ID</th>
              <th className="border-b p-2">Building</th>
              <th className="border-b p-2">Date</th>
              <th className="border-b p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAssessments.map((row) => (
              <tr key={row.id}>
                <td className="border-b p-2">{row.id}</td>
                <td className="border-b p-2">{row.building}</td>
                <td className="border-b p-2">{row.date}</td>
                <td className="border-b p-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

