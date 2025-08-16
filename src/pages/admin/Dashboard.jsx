import Card from "../../components/Card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card title="Students">1,240</Card>
  <Card title="Courses">48</Card>
  <Card title="Pending Approvals">6</Card>
</div>
<Card title="Recent Activity">No recent items.</Card>

    </div>
  );
}
