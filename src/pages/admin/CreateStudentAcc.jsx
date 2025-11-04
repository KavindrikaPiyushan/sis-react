
import React from "react";
import CreateStudentAccount from "../../components/CreateStudentAccount";
import { useLocation } from "react-router-dom";

export default function CreateStudentAcc() {
    const location = useLocation();
    const batchPrograms = location.state?.batchPrograms || [];
    const onBack = () => {
        window.history.back();
    };
    return (
        <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen px-2 sm:px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
                <CreateStudentAccount onBack={onBack} batchPrograms={batchPrograms} />
            </div>
        </main>
    );
}


