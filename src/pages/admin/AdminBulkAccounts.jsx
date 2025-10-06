import React from "react";
import BulkImportAdmins from "../../components/BulkImportAdmins";

export default function AdminBulkAccounts({ showConfirm }) {
  const onBack = () => {
    window.history.back();
  };
  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70  min-h-screen">
      <BulkImportAdmins  onBack={onBack} showConfirm={showConfirm} />
    </main>
  );
}
