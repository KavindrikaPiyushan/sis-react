import Card from "../../components/Card";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card title="Attendance">% 92</Card>
  <Card title="GPA">3.52</Card>
  <Card title="Outstanding Dues">LKR 0.00</Card>
</div>
<Card title="Upcoming">No upcoming events.</Card>

    </div>
  );
}
