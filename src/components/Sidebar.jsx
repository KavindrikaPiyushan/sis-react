import {  Bell,  GraduationCap,FileText, Calendar, Activity, BarChart3 } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navSections = [
    {
      title: "Main",
      items: [
        { icon: BarChart3, label: "Dashboard", href: "#", active: true }
      ]
    },
    {
      title: "Academic Management",
      items: [
        { icon: GraduationCap, label: "Results & GPA", href: "#" },
        { icon: Calendar, label: "Attendance", href: "#" }
      ]
    },
    {
      title: "Approvals",
      items: [
        { icon: FileText, label: "Medical Approvals", href: "#", badge: 3 },
        { icon: FileText, label: "Payment Receipts", href: "#", badge: 5 }
      ]
    },
    {
      title: "Content Management",
      items: [
        { icon: Bell, label: "Special Notices", href: "#" },
        { icon: Activity, label: "Hyperlinks", href: "#" }
      ]
    },
    {
      title: "System",
      items: [
        { icon: Activity, label: "System Logs", href: "#" }
      ]
    }
  ];

  return (
    <div className="flex ">
      
  <aside className={`fixed left-0 top-0 h-full w-[250px]  bg-white shadow-lg transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-14 bg-blue-900 text-white flex items-center px-6">
          <GraduationCap className="mr-3" size={24} />
          <span className="font-semibold">SIS Admin</span>
        </div>
        
        <nav className="p-4 overflow-y-auto h-full">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              {section.items.map((item, itemIdx) => (
                <a
                  key={itemIdx}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                    item.active 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
