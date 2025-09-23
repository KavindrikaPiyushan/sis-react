import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Eye, Star, Calendar, Users, BookOpen, CreditCard, HelpCircle, Globe, Clock, TrendingUp, ArrowRight } from 'lucide-react';

// Mock data - same as admin but from student perspective
const mockLinks = [
  {
    linkId: "link_2025_001",
    title: "📚 University Library",
    description: "Access e-books, journals, and past papers.",
    url: "https://library.university.edu",
    category: "academic",
    icon: "library",
    priority: "highlight",
    audience: ["all_students", "lecturers"],
    startDate: "2025-09-21T00:00:00Z",
    endDate: null,
    openMode: "new_tab",
    status: "published",
    clickCount: 245,
    isNew: false
  },
  {
    linkId: "link_2025_002",
    title: "💳 Online Fee Payment",
    description: "Pay semester fees and exam registration fees online.",
    url: "https://payments.university.edu",
    category: "finance",
    icon: "payment",
    priority: "highlight",
    audience: ["all_students"],
    startDate: "2025-09-15T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    openMode: "new_tab",
    status: "published",
    clickCount: 189,
    isNew: false
  },
  {
    linkId: "link_2025_003",
    title: "📊 LMS Portal",
    description: "Access course materials, assignments, and discussions.",
    url: "https://lms.university.edu",
    category: "academic",
    icon: "lms",
    priority: "normal",
    audience: ["all_students", "lecturers"],
    startDate: "2025-01-01T00:00:00Z",
    endDate: null,
    openMode: "new_tab",
    status: "published",
    clickCount: 567,
    isNew: false
  },
  {
    linkId: "link_2025_004",
    title: "🎓 Convocation Registration",
    description: "Register for the annual convocation ceremony.",
    url: "https://convocation.university.edu",
    category: "events",
    icon: "graduation",
    priority: "highlight",
    audience: ["final_year_students"],
    startDate: "2025-09-20T00:00:00Z",
    endDate: "2025-10-15T23:59:59Z",
    openMode: "new_tab",
    status: "published",
    clickCount: 78,
    isNew: true
  },
  {
    linkId: "link_2025_005",
    title: "🆘 Student Counseling",
    description: "Book appointments for academic and personal counseling.",
    url: "https://counseling.university.edu",
    category: "support",
    icon: "help",
    priority: "normal",
    audience: ["all_students"],
    startDate: "2025-01-01T00:00:00Z",
    endDate: null,
    openMode: "new_tab",
    status: "published",
    clickCount: 123,
    isNew: false
  },
  {
    linkId: "link_2025_006",
    title: "🌐 Coursera Partnership",
    description: "Access free courses through university partnership.",
    url: "https://coursera.org/university-partner",
    category: "external",
    icon: "external",
    priority: "normal",
    audience: ["all_students", "lecturers"],
    startDate: "2025-08-01T00:00:00Z",
    endDate: null,
    openMode: "new_tab",
    status: "published",
    clickCount: 89,
    isNew: false
  },
  {
    linkId: "link_2025_007",
    title: "📝 Exam Results Portal",
    description: "View your examination results and transcripts.",
    url: "https://results.university.edu",
    category: "academic",
    icon: "library",
    priority: "highlight",
    audience: ["all_students"],
    startDate: "2025-09-22T00:00:00Z",
    endDate: null,
    openMode: "new_tab",
    status: "published",
    clickCount: 334,
    isNew: true
  },
  {
    linkId: "link_2025_008",
    title: "🏥 Health Center",
    description: "Book medical appointments and health services.",
    url: "https://health.university.edu",
    category: "support",
    icon: "help",
    priority: "normal",
    audience: ["all_students"],
    startDate: "2025-01-01T00:00:00Z",
    endDate: null,
    openMode: "new_tab",
    status: "published",
    clickCount: 67,
    isNew: false
  }
];

const categories = [
  { id: 'all', name: 'All Links', icon: Globe, color: 'bg-gray-100 text-gray-800' },
  { id: 'academic', name: 'Academic', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
  { id: 'finance', name: 'Finance', icon: CreditCard, color: 'bg-green-100 text-green-800' },
  { id: 'events', name: 'Events', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  { id: 'support', name: 'Support', icon: HelpCircle, color: 'bg-orange-100 text-orange-800' },
  { id: 'external', name: 'External', icon: ExternalLink, color: 'bg-indigo-100 text-indigo-800' }
];

const priorityStyles = {
  highlight: 'border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-white shadow-md hover:shadow-lg',
  normal: 'border border-gray-200 bg-white hover:shadow-md'
};

const categoryIcons = {
  library: BookOpen,
  payment: CreditCard,
  lms: BookOpen,
  graduation: Calendar,
  help: HelpCircle,
  external: ExternalLink
};

export default function UsefulLinks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Mock student info - would come from auth context
  const studentInfo = {
    name: "John Doe",
    batch: "2024",
    year: "final_year_students"
  };

  const filteredLinks = useMemo(() => {
    return mockLinks.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
      const isActive = link.status === 'published';
      
      // Check if link is relevant to student
      const isRelevant = link.audience.includes('all_students') || 
                        link.audience.includes(studentInfo.year) ||
                        link.audience.includes(`batch_${studentInfo.batch}`);
      
      return matchesSearch && matchesCategory && isActive && isRelevant;
    });
  }, [searchTerm, selectedCategory, studentInfo]);

  const highlightedLinks = filteredLinks.filter(link => link.priority === 'highlight');
  const newLinks = filteredLinks.filter(link => link.isNew);
  const popularLinks = [...filteredLinks].sort((a, b) => b.clickCount - a.clickCount).slice(0, 3);

  const handleLinkClick = (link) => {
    // Track analytics
    console.log(`Link clicked: ${link.title}`);
    if (link.openMode === 'new_tab') {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link.url;
    }
  };

  const getLinkIcon = (iconType) => {
    const IconComponent = categoryIcons[iconType] || ExternalLink;
    return <IconComponent className="w-8 h-8 text-blue-600" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLinkExpiring = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const expiry = new Date(endDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Links</h1>
              <p className="text-gray-600">Access your important university resources and services</p>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="text-lg font-semibold text-gray-900">{studentInfo.name}</p>
            </div>
          </div>
          
          {/* New/Important Links Alert */}
          {newLinks.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  {newLinks.length} new link{newLinks.length > 1 ? 's' : ''} available!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const categoryLinkCount = mockLinks.filter(link => 
                category.id === 'all' ? true : link.category === category.id
              ).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.name}
                  <span className="ml-2 text-xs opacity-75">({categoryLinkCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Links</p>
                <p className="text-2xl font-bold text-blue-600">{filteredLinks.length}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Priority Links</p>
                <p className="text-2xl font-bold text-yellow-600">{highlightedLinks.length}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Week</p>
                <p className="text-2xl font-bold text-green-600">{newLinks.length}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          {/* <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Most Popular</p>
                <p className="text-2xl font-bold text-purple-600">{popularLinks[0]?.clickCount || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div> */}
        </div>

        {/* Priority Links Section */}
        {highlightedLinks.length > 0 && selectedCategory === 'all' && !searchTerm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Priority Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlightedLinks.map((link) => (
                <LinkCard key={link.linkId} link={link} onLinkClick={handleLinkClick} />
              ))}
            </div>
          </div>
        )}

        {/* All Links Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Links' : categories.find(c => c.id === selectedCategory)?.name}
              <span className="ml-2 text-sm text-gray-500">({filteredLinks.length})</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => (
              <LinkCard key={link.linkId} link={link} onLinkClick={handleLinkClick} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredLinks.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No links found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your search or filter criteria to find what you're looking for" 
                : "No special links are available for you at this time"}
            </p>
          </div>
        )}

        {/* Popular Links Sidebar - Desktop Only */}
        {/* {popularLinks.length > 0 && (
          <div className="hidden xl:block fixed right-6 top-1/2 transform -translate-y-1/2 w-80">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                Popular Links
              </h3>
              <div className="space-y-3">
                {popularLinks.slice(0, 3).map((link, index) => (
                  <div
                    key={link.linkId}
                    onClick={() => handleLinkClick(link)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                  >
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-purple-600 bg-purple-100 rounded-full">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {link.title}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {link.clickCount} views
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </main>
  );
}

// Link Card Component
function LinkCard({ link, onLinkClick }) {
  const categoryInfo = categories.find(c => c.id === link.category);
  const CategoryIcon = categoryInfo?.icon || Globe;
  
  return (
    <div
      className={`group relative rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
        priorityStyles[link.priority]
      }`}
      onClick={() => onLinkClick(link)}
    >
      {/* Priority Badge */}
      {link.priority === 'highlight' && (
        <div className="absolute top-3 right-3">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
        </div>
      )}

      {/* New Badge */}
      {link.isNew && (
        <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
          NEW
        </div>
      )}

      {/* Expiring Soon Badge */}
      {isLinkExpiring(link.endDate) && (
        <div className="absolute top-3 right-3 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
          Expires in {getDaysUntilExpiry(link.endDate)} days
        </div>
      )}

      {/* Link Content */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getLinkIcon(link.icon)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
            {link.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {link.description}
          </p>
          
          {/* Category and Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                {categoryInfo?.name}
              </span>
              <span className="flex items-center text-gray-500">
                <Eye className="w-3 h-3 mr-1" />
                {link.clickCount} views
              </span>
            </div>
            
            {link.endDate && (
              <span className="text-orange-600 font-medium">
                Until {formatDate(link.endDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Effect Arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  );
}

// Helper functions
function isLinkExpiring(endDate) {
  if (!endDate) return false;
  const today = new Date();
  const expiry = new Date(endDate);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

function getDaysUntilExpiry(endDate) {
  if (!endDate) return null;
  const today = new Date();
  const expiry = new Date(endDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function getLinkIcon(iconType) {
  const IconComponent = categoryIcons[iconType] || ExternalLink;
  return <IconComponent className="w-8 h-8 text-blue-600" />;
}

function formatDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}