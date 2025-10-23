import React from "react";
import { Megaphone, AlertTriangle, PartyPopper } from "lucide-react";

const getNoticeIcon = (type) => {
  switch (type) {
    case "campaign":
      return <Megaphone className="w-7 h-7 text-blue-900" />;
    case "warning":
      return <AlertTriangle className="w-7 h-7 text-yellow-500" />;
    case "celebration":
      return <PartyPopper className="w-7 h-7 text-green-600" />;
    default:
      return <Megaphone className="w-7 h-7 text-gray-400" />;
  }
};

export default function NoticeList({ notices }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-4 border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">Latest Notices</h3>
        <p className="text-sm text-gray-500">Important announcements and updates</p>
      </div>
      <div className="space-y-4">
        {notices.map((notice, idx) => (
          <div key={idx} className={`flex gap-4 p-4 border-l-4 ${notice.border} ${notice.bg} rounded-lg`}>
            {getNoticeIcon(notice.icon)}
            <div className="flex-1">
              <h5 className="font-bold text-gray-900 mb-1">{notice.title}</h5>
              <p className="text-sm text-gray-500 mb-1">{notice.desc}</p>
              <span className="text-xs text-gray-400">{notice.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4 flex justify-end">
        <a href="/student/notices" className="text-blue-900 border border-blue-900 px-4 py-2 rounded-lg hover:bg-blue-900 hover:text-white transition font-semibold">View All Notices</a>
      </div>
    </div>
  );
}
