import BulkImportStudents from "../../components/BulkImportStudents"

export default function StudentBulkAccounts() {
    const onBack = () => {
        window.history.back();
        };
  return (
     <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70  min-h-screen">
       <BulkImportStudents onBack={onBack} />
    </main>
  );
}
