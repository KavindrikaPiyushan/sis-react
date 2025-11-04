import React from "react";
import BulkImportAdmins from "../../components/BulkImportAdmins";

export default function AdminBulkAccounts({ showConfirm }) {
  const onBack = () => {
    window.history.back();
  };
  return (
    <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <BulkImportAdmins  onBack={onBack} showConfirm={showConfirm} />
      </div>
    </main>
  );
}
