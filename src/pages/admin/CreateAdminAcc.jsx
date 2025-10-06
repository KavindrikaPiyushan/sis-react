import React from 'react'
import CreateAdminAccount from '../../components/CreateAdminAccount'

export default function CreateAdminAcc({ showConfirm }) {
    const onBack = () => {
        window.history.back();
        };
  return (
  <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70  min-h-screen">
      <CreateAdminAccount  onBack={onBack} showConfirm={showConfirm} />
    </main>

  )
}
