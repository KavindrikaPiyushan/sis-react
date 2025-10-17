import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, ExternalLink, Edit, Archive, Eye, Filter, Star, Calendar, Users, BookOpen, CreditCard, HelpCircle, Globe, X, Save, Link as LinkIcon, Image, Clock, Target, Monitor, MousePointer, Trash2 } from 'lucide-react';
import LinksService from '../../services/common/linksService';
import LoadingComponent from '../../components/LoadingComponent';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../../components/ConfirmDialog';

// Category definitions updated to match API enums
const categories = [
  { id: 'all', name: 'All Links', icon: Globe, color: 'bg-gray-100 text-gray-800' },
  { id: 'Academic', name: 'Academic', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
  { id: 'Administrative', name: 'Administrative', icon: CreditCard, color: 'bg-green-100 text-green-800' },
  { id: 'Events', name: 'Events', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  { id: 'Student Services', name: 'Support', icon: HelpCircle, color: 'bg-orange-100 text-orange-800' },
  { id: 'Library', name: 'Library', icon: BookOpen, color: 'bg-indigo-100 text-indigo-800' },
  { id: 'Research', name: 'Research', icon: Users, color: 'bg-teal-100 text-teal-800' }
];

const priorityStyles = {
  highlight: 'border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-white shadow-md',
  normal: 'border border-gray-200 bg-white'
};

export default function SpecialLinks({ showConfirm }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({ total: 0, active: 0, inactive: 0, byPriority: { normal: 0, highlight: 0 } });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, link: null });
  
  // Get user role from localStorage (or your auth context)
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userRole = userData.role || 'student';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // Form state for creating/editing links
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'Academic',
    icon: '',
    priority: 'normal',
    targetAudience: 'all',
    // audience array used by checkbox list
    audience: [],
    startDate: '',
    endDate: '',
    openMode: 'newtab',
    isActive: true,
    order: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadLinks();
    if (isAdmin) {
      loadStatistics();
      loadCategories();
    }
  }, [selectedCategory, searchTerm, isAdmin]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: 'order',
        sortOrder: 'asc'
      };
      
      let response;
      if (isAdmin) {
        response = await LinksService.getAllLinks(params);
      } else {
        response = await LinksService.getActiveLinks(params);
      }
      
      if (response && response.success) {
        const serverLinks = response.data || [];
        // If server doesn't provide per-user viewed info, fall back to localStorage
        const locallyViewed = getLocallyViewed();
        const normalized = serverLinks.map(l => ({
          ...l,
          userHasViewed: l.userHasViewed === true || locallyViewed.includes(l.id)
        }));
        setLinks(normalized);
      } else {
        showToast('error', 'Error', 'Failed to load links');
      }
    } catch (error) {
      console.error('Error loading links:', error);
      showToast('error', 'Error', 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  // LocalStorage helpers for anonymous/view fallback
  const LOCAL_VIEWED_KEY = 'viewed_links_v1';
  const getLocallyViewed = () => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_VIEWED_KEY) || '[]');
    } catch {
      return [];
    }
  };
  const markLocallyViewed = (id) => {
    try {
      const arr = new Set(getLocallyViewed());
      arr.add(id);
      localStorage.setItem(LOCAL_VIEWED_KEY, JSON.stringify([...arr]));
    } catch (e) {
      console.warn('Could not mark locally viewed', e);
    }
  };
  const isLocallyViewed = (id) => getLocallyViewed().includes(id);

  const NEW_WINDOW_DAYS = 7;
  const isNewForUser = (link) => {
    const created = link.createdAt || link.startDate || link.createdAt;
    const withinWindow = created && ((Date.now() - new Date(created)) <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const serverFlag = !!link.isNew;
    const notViewed = !link.userHasViewed && !isLocallyViewed(link.id);
    return (serverFlag || withinWindow) && notViewed;
  };

  const loadStatistics = async () => {
    try {
      const response = await LinksService.getStatistics();
      if (response && response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await LinksService.getCategories();
      if (response && response.success) {
        setAvailableCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // CRUD Operations
  const handleCreateLink = async (linkData) => {
    try {
      const response = await LinksService.createLink(linkData);
      if (response && response.success) {
        showToast('success', 'Success', 'Link created successfully');
        await loadLinks(); // Reload links
        // refresh admin stats as well
        if (isAdmin) await loadStatistics();
        return true;
      } else {
        showToast('error', 'Error', response?.message || 'Failed to create link');
        return false;
      }
    } catch (error) {
      console.error('Error creating link:', error);
      showToast('error', 'Error', 'Failed to create link');
      return false;
    }
  };

  const handleUpdateLink = async (linkId, linkData) => {
    try {
      const response = await LinksService.updateLink(linkId, linkData);
      if (response && response.success) {
        showToast('success', 'Success', 'Link updated successfully');
        await loadLinks(); // Reload links
        if (isAdmin) await loadStatistics();
        return true;
      } else {
        showToast('error', 'Error', response?.message || 'Failed to update link');
        return false;
      }
    } catch (error) {
      console.error('Error updating link:', error);
      showToast('error', 'Error', 'Failed to update link');
      return false;
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      const response = await LinksService.deleteLink(linkId);
      if (response && response.success) {
        showToast('success', 'Success', 'Link deleted successfully');
        await loadLinks(); // Reload links
        if (isAdmin) await loadStatistics(); // Reload stats
        // close any confirm dialog state
        setConfirmDelete({ show: false, link: null });
      } else {
        showToast('error', 'Error', response?.message || 'Failed to delete link');
        setConfirmDelete({ show: false, link: null });
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      showToast('error', 'Error', 'Failed to delete link');
      setConfirmDelete({ show: false, link: null });
    }
  };

  const handleToggleStatus = async (linkId) => {
    try {
      const response = await LinksService.toggleLinkStatus(linkId);
      if (response && response.success) {
        showToast('success', 'Success', 'Link status updated successfully');
        await loadLinks(); // Reload links
        if (isAdmin) await loadStatistics();
      } else {
        showToast('error', 'Error', response?.message || 'Failed to update link status');
      }
    } catch (error) {
      console.error('Error toggling link status:', error);
      showToast('error', 'Error', 'Failed to update link status');
    }
  };

  const handleToggleNew = async (link) => {
    try {
      const response = await LinksService.updateLink(link.id, { isNew: !link.isNew });
      if (response && response.success) {
        showToast('success', 'Success', link.isNew ? 'Link unmarked as New' : 'Link marked as New');
        await loadLinks();
        if (isAdmin) await loadStatistics();
      } else {
        showToast('error', 'Error', response?.message || 'Failed to update link new status');
      }
    } catch (error) {
      console.error('Error toggling new status:', error);
      showToast('error', 'Error', 'Failed to update link new status');
    }
  };
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
      const isActive = isAdmin ? true : link.isActive; // Admins see all, users see active only
      return matchesSearch && matchesCategory && isActive;
    });
  }, [searchTerm, selectedCategory, links, isAdmin]);

  // Split filtered links into highlighted and normal for prioritized rendering
  const highlightedLinks = filteredLinks.filter(l => l.priority === 'highlight');
  const normalLinks = filteredLinks.filter(l => l.priority !== 'highlight');
  // Count links considered 'new' for the current user
  const newLinksCount = filteredLinks.filter(l => isNewForUser(l)).length;

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      category: 'Academic',
      icon: '',
      priority: 'normal',
      targetAudience: 'all',
      // audience is an array of audience keys used by checkboxes
      audience: [],
      startDate: '',
      endDate: '',
      openMode: 'newtab',
      isActive: true,
      order: 0
    });
    setEditingLink(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (link) => {
    setFormData({
      title: link.title,
      description: link.description || '',
      url: link.url,
      category: link.category || 'Academic',
      icon: link.icon || '',
      priority: link.priority || 'normal',
      targetAudience: link.targetAudience || 'all',
      // ensure audience is always an array to avoid .includes errors
      audience: Array.isArray(link.audience) ? link.audience : (link.audience ? [link.audience] : []),
      startDate: link.startDate ? new Date(link.startDate).toISOString().split('T')[0] : '',
      endDate: link.endDate ? new Date(link.endDate).toISOString().split('T')[0] : '',
      openMode: link.openMode || 'newtab',
      isActive: link.isActive !== undefined ? link.isActive : true,
      order: link.order || 0
    });
    setEditingLink(link);
    setShowAddModal(true);
  };

  // Audience checkbox handler (keeps audience as an array)
  const handleAudienceChange = (audienceId, checked) => {
    setFormData(prev => {
      const current = Array.isArray(prev.audience) ? prev.audience : [];
      if (checked) {
        // add if not present
        if (!current.includes(audienceId)) {
          return { ...prev, audience: [...current, audienceId] };
        }
        return prev;
      } else {
        return { ...prev, audience: current.filter(a => a !== audienceId) };
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = LinksService.validateLinkData(formData);
    if (!validation.isValid) {
      showToast('error', 'Validation Error', validation.errors.join(', '));
      return;
    }

    // Format data for API
    const linkData = LinksService.formatLinkData(formData);
    
    let success = false;
    if (editingLink) {
      // Update existing link
      success = await handleUpdateLink(editingLink.id, linkData);
    } else {
      // Create new link
      success = await handleCreateLink(linkData);
    }

    if (success) {
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleConfirmDelete = (link) => {
    if (showConfirm) {
      showConfirm(
        'Delete Link',
        `Are you sure you want to delete "${link.title}"? This action cannot be undone.`,
        () => handleDeleteLink(link.id)
      );
    } else {
      setConfirmDelete({ show: true, link });
    }
  };

  const handleArchiveLink = (link) => {
    handleToggleStatus(link.id);
  };

  const handleLinkClick = (link) => {
    // In real implementation, this would track analytics
    // Optimistically increment local click count for immediate UX
    try {
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, viewCount: (l.viewCount || 0) + 1 } : l));
    } catch (err) {
      console.warn('Could not increment local view count', err);
    }

    // Fire-and-forget server call to record the click
    LinksService.recordClick(link.id).catch(e => console.debug('recordView failed', e));

    // Mark as viewed locally and update UI immediately
    try {
      // mark server-side view if API available (fire-and-forget)
      LinksService.recordView?.(link.id).catch?.(() => {});
    } catch (e) {
      // ignore
    }

    // Update local viewed state so NEW badge disappears
    try {
      markLocallyViewed(link.id);
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, userHasViewed: true } : l));
    } catch (err) {
      console.warn('Could not mark locally viewed', err);
    }

    if (link.openMode === 'newtab') {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link.url;
    }
  };

  const getLinkIcon = (category) => {
    const iconMap = {
      'Academic': BookOpen,
      'Administrative': CreditCard,
      'Events': Calendar,
      'Student Services': HelpCircle,
      'Library': BookOpen,
      'Research': Users
    };
    const IconComponent = iconMap[category] || ExternalLink;
    return <IconComponent className="w-8 h-8 text-blue-600" />;
  };

  const getCreatorLabel = (link) => {
    // prefer createdByUser display name, fallback to id
    const creator = link.createdByUser;
    const creatorName = creator ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() : link.createdBy || '';
    if (userData && userData.id && (userData.id === link.createdBy || userData.id === link.createdByUser?.id)) {
      return 'Me';
    }
    return creatorName || 'Unknown';
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
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="p-6 ">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Special Links</h1>
            <p className="text-gray-600">Quick access to important university resources and services</p>
          </div>
          
          {isAdmin && (
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

        {/* Stats Summary - Only for Admins */}
        { !loading && isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Links</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Links</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.active || 0}</p>
                </div>
                <Star className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Highlighted</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.byPriority?.highlight || 0}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats - Students (when not admin) */}
        { !loading && !isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <p className="text-2xl font-bold text-green-600">{newLinksCount}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Links Grid (highlighted + all links) */}
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="max-w-3xl mx-auto">
                <LoadingComponent message="Loading links..." />
              </div>
            </div>
          ) : (
            <>
              {/* Highlighted (priority) links - show first */}
              {highlightedLinks.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Highlighted Links</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {highlightedLinks.map((link) => {
                      const categoryInfo = categories.find(c => c.id === link.category);
                      const CategoryIcon = categoryInfo?.icon || Globe;
                      return (
                        <div
                          key={link.id}
                          className={`group relative rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 overflow-hidden ${
                            priorityStyles[link.priority] || priorityStyles.normal
                          }`}
                          onClick={() => handleLinkClick(link)}
                        >
                          {/* Reuse the same card markup as below for highlighted links */}
                          {link.priority === 'highlight' && (
                            <div className="absolute top-3 right-3">
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            </div>
                          )}
                          {isAdmin && !link.isActive && (
                            <div className="absolute top-3 left-3 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Inactive
                            </div>
                          )}
                          {isNewForUser(link) && (
                            <div className="absolute top-3 left-3 ml-0 mt-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              NEW
                            </div>
                          )}

                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">{getLinkIcon(link.category)}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{link.title}</h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{link.description}</p>
                              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                                    <CategoryIcon className="w-3 h-3 mr-1" />
                                    {categoryInfo?.name || link.category}
                                  </span>
                                  <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                    <Target className="w-3 h-3 mr-1" />
                                    <span className="truncate max-w-[8rem] block">{link.targetAudience}</span>
                                  </span>
                                  <span className="flex items-center text-gray-500 ml-2">
                                    <Eye className="w-3 h-3 mr-1" />
                                    <span className="truncate max-w-[6.5rem] block">{link.viewCount || 0} views</span>
                                  </span>
                                  <span className="flex items-center text-gray-500 ml-2">
                                    <Monitor className="w-3 h-3 mr-1" />
                                    <span className="truncate max-w-[9rem] block">{getCreatorLabel(link)}</span>
                                  </span>
                                </div>
                                {link.endDate && (
                                  <span className="text-orange-600 flex-shrink-0 ml-2">Until {formatDate(link.endDate)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Edit button only visible to the user who created the link */}
                              {(userData.id && (userData.id === link.createdBy || userData.id === link.createdByUser?.id)) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditModal(link); }}
                                  className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                  title="Edit Link"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleArchiveLink(link); }}
                                className={`p-1 rounded hover:bg-opacity-80 ${link.isActive ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                title={link.isActive ? "Deactivate Link" : "Activate Link"}
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleNew(link); }}
                                className={`p-1 rounded ${link.isNew ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                title={link.isNew ? "Unmark New" : "Mark as New"}
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleConfirmDelete(link); }}
                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                title="Delete Link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Links (non-highlighted) */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">All Links</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {normalLinks.map((link) => {
                  const categoryInfo = categories.find(c => c.id === link.category);
                  const CategoryIcon = categoryInfo?.icon || Globe;
                  return (
                    <div
                      key={link.id}
                      className={`group relative rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 overflow-hidden ${
                        priorityStyles[link.priority] || priorityStyles.normal
                      }`}
                      onClick={() => handleLinkClick(link)}
                    >
                      {/* Priority Badge */}
                      {link.priority === 'highlight' && (
                        <div className="absolute top-3 right-3">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                      )}

                      {/* Inactive Badge for Admins */}
                      {isAdmin && !link.isActive && (
                        <div className="absolute top-3 left-3 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Inactive
                        </div>
                      )}

                      {/* Expiring Soon Badge */}
                      {isLinkExpiring(link.endDate) && (
                        <div className="absolute top-3 left-3 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          Expires Soon
                        </div>
                      )}

                      {isNewForUser(link) && (
                        <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          NEW
                        </div>
                      )}

                      {/* Link Content */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">{getLinkIcon(link.category)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{link.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{link.description}</p>
                          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {categoryInfo?.name || link.category}
                              </span>
                              <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                <Target className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[8rem] block">{link.targetAudience}</span>
                              </span>
                              <span className="flex items-center text-gray-500 ml-2">
                                <Eye className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[6.5rem] block">{link.viewCount || 0} views</span>
                              </span>
                              <span className="flex items-center text-gray-500 ml-2">
                                <Monitor className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[9rem] block">{getCreatorLabel(link)}</span>
                              </span>
                            </div>
                            {link.endDate && (
                              <span className="text-orange-600 flex-shrink-0 ml-2">Until {formatDate(link.endDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Actions - Only for admin and super_admin */}
                      {isAdmin && (
                        <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit button only visible to the user who created the link */}
                          {(userData.id && (userData.id === link.createdBy || userData.id === link.createdByUser?.id)) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(link); }}
                              className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              title="Edit Link"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleArchiveLink(link); }}
                            className={`p-1 rounded hover:bg-opacity-80 ${link.isActive ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                            title={link.isActive ? "Deactivate Link" : "Activate Link"}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleNew(link); }}
                            className={`p-1 rounded ${link.isNew ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title={link.isNew ? "Unmark New" : "Mark as New"}
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleConfirmDelete(link); }}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            title="Delete Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>

        {/* Empty State */}
        { !loading && filteredLinks.length === 0 && (
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
                        <option value="Academic">📚 Academic</option>
                        <option value="Administrative">🏛️ Administrative</option>
                        <option value="Events">🎓 Events</option>
                        <option value="Student Services">🆘 Student Services</option>
                        <option value="Library">📖 Library</option>
                        <option value="Research">🔬 Research</option>
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

                  {/* Target Audience and Open Mode Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <select
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">� All Users</option>
                        <option value="students">�‍🎓 Students</option>
                        <option value="admins">👨‍💼 Admins</option>
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
                        <option value="newtab">🔗 New Tab</option>
                        <option value="sametab">📄 Same Tab</option>
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
        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDelete.show}
          title={confirmDelete.link ? `Delete "${confirmDelete.link.title}"` : 'Delete Link'}
          message={confirmDelete.link ? `Are you sure you want to delete "${confirmDelete.link.title}"? This action cannot be undone.` : 'Are you sure you want to delete this link?'}
          onConfirm={() => {
            if (confirmDelete.link) {
              handleDeleteLink(confirmDelete.link.id);
            }
          }}
          onCancel={() => setConfirmDelete({ show: false, link: null })}
        />
      </div>
    </main>
  );
}