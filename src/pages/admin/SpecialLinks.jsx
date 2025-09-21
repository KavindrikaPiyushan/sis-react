import React, { useState, useMemo } from 'react';
import { Search, Plus, ExternalLink, Edit, Archive, Eye, Filter, Star, Calendar, Users, BookOpen, CreditCard, HelpCircle, Globe, X, Save, Link as LinkIcon, Image, Clock, Target, Monitor, MousePointer } from 'lucide-react';

// Mock data based on your documentation
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
    clickCount: 245
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
    clickCount: 189
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
    clickCount: 567
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
    clickCount: 78
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
    clickCount: 123
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
    clickCount: 89
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
  highlight: 'border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-white shadow-md',
  normal: 'border border-gray-200 bg-white'
};

const categoryIcons = {
  library: BookOpen,
  payment: CreditCard,
  lms: BookOpen,
  graduation: Calendar,
  help: HelpCircle,
  external: ExternalLink
};

export default function SpecialLinks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [links, setLinks] = useState(mockLinks);
  const [userRole] = useState('admin'); // Mock user role - would come from auth context

  // Form state for creating/editing links
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'academic',
    icon: 'library',
    priority: 'normal',
    audience: ['all_students'],
    startDate: '',
    endDate: '',
    openMode: 'new_tab'
  });

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
      const isActive = link.status === 'published';
      return matchesSearch && matchesCategory && isActive;
    });
  }, [searchTerm, selectedCategory, links]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      category: 'academic',
      icon: 'library',
      priority: 'normal',
      audience: ['all_students'],
      startDate: '',
      endDate: '',
      openMode: 'new_tab'
    });
    setEditingLink(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (link) => {
    setFormData({
      title: link.title.replace(/^[\u{1F300}-\u{1F6FF}]\s*/u, ''), // Remove emoji from title
      description: link.description,
      url: link.url,
      category: link.category,
      icon: link.icon,
      priority: link.priority,
      audience: link.audience,
      startDate: link.startDate ? new Date(link.startDate).toISOString().split('T')[0] : '',
      endDate: link.endDate ? new Date(link.endDate).toISOString().split('T')[0] : '',
      openMode: link.openMode
    });
    setEditingLink(link);
    setShowAddModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAudienceChange = (audienceType, checked) => {
    setFormData(prev => ({
      ...prev,
      audience: checked 
        ? [...prev.audience, audienceType]
        : prev.audience.filter(a => a !== audienceType)
    }));
  };

  const generateLinkId = () => {
    const timestamp = Date.now();
    return `link_${new Date().getFullYear()}_${timestamp}`;
  };

  const getEmojiForCategory = (category) => {
    const emojiMap = {
      academic: '📚',
      finance: '💳',
      events: '🎓',
      support: '🆘',
      external: '🌐'
    };
    return emojiMap[category] || '🔗';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const linkData = {
      ...formData,
      linkId: editingLink ? editingLink.linkId : generateLinkId(),
      title: `${getEmojiForCategory(formData.category)} ${formData.title}`,
      status: 'published',
      clickCount: editingLink ? editingLink.clickCount : 0,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      createdAt: editingLink ? editingLink.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingLink) {
      // Update existing link
      setLinks(prev => prev.map(link => 
        link.linkId === editingLink.linkId ? linkData : link
      ));
    } else {
      // Add new link
      setLinks(prev => [...prev, linkData]);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleArchiveLink = (linkId) => {
    setLinks(prev => prev.map(link => 
      link.linkId === linkId ? { ...link, status: 'archived' } : link
    ));
  };

  const handleLinkClick = (link) => {
    // In real implementation, this would track analytics
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

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Links</h1>
            <p className="text-gray-600">Quick access to important university resources and services</p>
          </div>
          
          {userRole === 'admin' && (
            <button
              onClick={openAddModal}
              className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Link
            </button>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">{links.length}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Highlighted</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {links.filter(l => l.priority === 'highlight').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-green-600">{categories.length - 1}</p>
              </div>
              <Filter className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-purple-600">
                  {links.reduce((sum, link) => sum + link.clickCount, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => {
            const categoryInfo = categories.find(c => c.id === link.category);
            const CategoryIcon = categoryInfo?.icon || Globe;
            
            return (
              <div
                key={link.linkId}
                className={`group relative rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  priorityStyles[link.priority]
                }`}
                onClick={() => handleLinkClick(link)}
              >
                {/* Priority Badge */}
                {link.priority === 'highlight' && (
                  <div className="absolute top-3 right-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                )}

                {/* Expiring Soon Badge */}
                {isLinkExpiring(link.endDate) && (
                  <div className="absolute top-3 left-3 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Expires Soon
                  </div>
                )}

                {/* Link Content */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getLinkIcon(link.icon)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {link.description}
                    </p>
                    
                    {/* Category and Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {categoryInfo?.name}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {link.clickCount}
                        </span>
                      </div>
                      
                      {link.endDate && (
                        <span className="text-orange-600">
                          Until {formatDate(link.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {userRole === 'admin' && (
                  <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(link);
                      }}
                      className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="Edit Link"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveLink(link.linkId);
                      }}
                      className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Archive Link"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No links found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "No special links have been added yet"}
            </p>
          </div>
        )}

        {/* Quick Actions Bar - Admin Only */}
        {userRole === 'admin' && (
          <div className="fixed bottom-6 right-6 lg:hidden">
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Add/Edit Link Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingLink ? 'Edit Special Link' : 'Add New Special Link'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., University Library"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of what this link provides..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        required
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Category and Priority Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="academic">📚 Academic</option>
                        <option value="finance">💳 Finance</option>
                        <option value="events">🎓 Events</option>
                        <option value="support">🆘 Support</option>
                        <option value="external">🌐 External</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="normal">Normal</option>
                        <option value="highlight">⭐ Highlight</option>
                      </select>
                    </div>
                  </div>

                  {/* Icon and Open Mode Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) => handleInputChange('icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="library">📚 Library</option>
                        <option value="payment">💳 Payment</option>
                        <option value="lms">📊 LMS</option>
                        <option value="graduation">🎓 Graduation</option>
                        <option value="help">🆘 Help</option>
                        <option value="external">🌐 External</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Mode
                      </label>
                      <select
                        value={formData.openMode}
                        onChange={(e) => handleInputChange('openMode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="new_tab">🔗 New Tab</option>
                        <option value="same_tab">📄 Same Tab</option>
                      </select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Target Audience
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'all_students', label: '👥 All Students' },
                        { id: 'lecturers', label: '👨‍🏫 Lecturers' },
                        { id: 'final_year_students', label: '🎓 Final Year Students' },
                        { id: 'new_students', label: '🆕 New Students' },
                        { id: 'batch_2023', label: '📅 Batch 2023' },
                        { id: 'batch_2024', label: '📅 Batch 2024' }
                      ].map((audience) => (
                        <label key={audience.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.audience.includes(audience.id)}
                            onChange={(e) => handleAudienceChange(audience.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{audience.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingLink ? 'Update Link' : 'Create Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}