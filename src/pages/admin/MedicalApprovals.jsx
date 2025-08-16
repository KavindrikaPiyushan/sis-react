import Card from "../../components/Card";

export default function MedicalApprovals() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Medical Approvals</h1>
      <Card>
  <div className="overflow-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50"><th className='px-3 py-2 text-left font-medium'>Report #</th><th className='px-3 py-2 text-left font-medium'>Student</th><th className='px-3 py-2 text-left font-medium'>Date</th><th className='px-3 py-2 text-left font-medium'>Decision</th></thead>
      <tbody><tr className='border-b'><td className='px-3 py-2'>Item 1.1</td><td className='px-3 py-2'>Item 1.2</td><td className='px-3 py-2'>Item 1.3</td><td className='px-3 py-2'>Item 1.4</td></tr><tr className='border-b'><td className='px-3 py-2'>Item 2.1</td><td className='px-3 py-2'>Item 2.2</td><td className='px-3 py-2'>Item 2.3</td><td className='px-3 py-2'>Item 2.4</td></tr><tr className='border-b'><td className='px-3 py-2'>Item 3.1</td><td className='px-3 py-2'>Item 3.2</td><td className='px-3 py-2'>Item 3.3</td><td className='px-3 py-2'>Item 3.4</td></tr><tr className='border-b'><td className='px-3 py-2'>Item 4.1</td><td className='px-3 py-2'>Item 4.2</td><td className='px-3 py-2'>Item 4.3</td><td className='px-3 py-2'>Item 4.4</td></tr><tr className='border-b'><td className='px-3 py-2'>Item 5.1</td><td className='px-3 py-2'>Item 5.2</td><td className='px-3 py-2'>Item 5.3</td><td className='px-3 py-2'>Item 5.4</td></tr></tbody>
    </table>
  </div>
</Card>
    </div>
  );
}
