import Card from "../../components/Card";

export default function UsefulLinks() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Useful Links</h1>
      
<Card>
  <ul className="list-disc pl-6 space-y-2">
    <li><a className="text-blue-600 underline" href="#">Attendance Portal</a></li>
    <li><a className="text-blue-600 underline" href="#">Exam Timetable</a></li>
    <li><a className="text-blue-600 underline" href="#">Payments</a></li>
  </ul>
</Card>

    </div>
  );
}
