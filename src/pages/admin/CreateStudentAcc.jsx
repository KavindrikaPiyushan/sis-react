import React from "react";
import CreateStudentAccount from "../../components/CreateStudentAccount";

export default function CreateStudentAcc() {
    const onBack = () => {
        window.history.back();
        };
  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70  min-h-screen">
      <CreateStudentAccount onBack={onBack} />
    </main>
  );
}


