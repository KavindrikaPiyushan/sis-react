import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, ExternalLink, Edit, Archive, Eye, Filter, Star, Calendar, Users, BookOpen, CreditCard, HelpCircle, Globe, X, Save, Link, Clock, Target, Monitor, MousePointer, Trash2, ChevronRight } from 'lucide-react';
import LinksService from '../../services/common/linksService';
import LoadingComponent from '../../components/LoadingComponent';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import HeaderBar from '../../components/HeaderBar';

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

// Link Preview Modal Component
function LinkPreviewModal({ link, onClose, onVisit, isAdmin, onEdit, onDelete, onToggleStatus, onToggleNew, userData }) {
  if (!link) return null;

  const categoryInfo = categories.find(c => c.id === link.category);
  const CategoryIcon = categoryInfo?.icon || Globe;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit'
    });
  };

  const getCreatorLabel = () => {
    const creator = link.createdByUser;
    const creatorName = creator ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() : link.createdBy || '';
    if (userData && userData.id && (userData.id === link.createdBy || userData.id === link.createdByUser?.id)) {
      return 'You';
    }
    return creatorName || 'Unknown';
  };

  const canEdit = userData?.id && (userData.id === link.createdBy || userData.id === link.createdByUser?.id);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-start justify-between z-10">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0">
                <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{link.title}</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                <CategoryIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {categoryInfo?.name || link.category}
              </span>
              {link.priority === 'highlight' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 fill-current" />
                  Highlighted
                </span>
              )}
              {link.isNew && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-800 font-medium">
                  NEW
                </span>
              )}
              {isAdmin && !link.isActive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm bg-red-100 text-red-800">
                  Inactive
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Description */}
          {link.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{link.description}</p>
            </div>
          )}

          {/* URL */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Link URL</h3>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all text-sm sm:text-base"
              onClick={(e) => e.stopPropagation()}
            >
              {link.url}
            </a>
          </div>

          {/* Details Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Target Audience</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{link.targetAudience}</p>
                </div>
              </div> */}

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Eye className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Total Views</p>
                  <p className="text-sm font-medium text-gray-900">{link.viewCount || 0} views</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <ExternalLink className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Open Mode</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{link.openMode === 'newtab' ? 'New Tab' : 'Same Tab'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Monitor className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Created By</p>
                  <p className="text-sm font-medium text-gray-900">{getCreatorLabel()}</p>
                </div>
              </div>

              {link.startDate && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(link.startDate)}</p>
                  </div>
                </div>
              )}

              {link.endDate && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">End Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(link.endDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Admin Actions</h3>
              <div className="flex flex-wrap gap-2">
                {canEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(link); onClose(); }}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleStatus(link.id); onClose(); }}
                  className={`inline-flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                    link.isActive 
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {link.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleNew(link); onClose(); }}
                  className={`inline-flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                    link.isNew 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {link.isNew ? 'Unmark New' : 'Mark New'}
                </button>
                {canEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(link); onClose(); }}
                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => { onVisit(link); onClose(); }}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            Visit Link
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpecialLinks({ showConfirm }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({ total: 0, active: 0, inactive: 0, byPriority: { normal: 0, highlight: 0 } });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, link: null });

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userRole = userData.role || 'student';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'Academic',
    icon: '',
    priority: 'normal',
    targetAudience: 'all',
    audience: [],
    startDate: '',
    endDate: '',
    openMode: 'newtab',
    isActive: true,
    order: 0
  });

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
      
      const response = await LinksService.getActiveLinks(params);
      
      if (response && response.success) {
        const serverLinks = response.data || [];
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

  const handleCreateLink = async (linkData) => {
    try {
      const response = await LinksService.createLink(linkData);
      if (response && response.success) {
        showToast('success', 'Success', 'Link created successfully');
        await loadLinks();
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
        await loadLinks();
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
        await loadLinks();
        if (isAdmin) await loadStatistics();
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
        await loadLinks();
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
      const isActive = isAdmin ? true : link.isActive;
      return matchesSearch && matchesCategory && isActive;
    });
  }, [searchTerm, selectedCategory, links, isAdmin]);

  const highlightedLinks = filteredLinks.filter(l => l.priority === 'highlight');
  const normalLinks = filteredLinks.filter(l => l.priority !== 'highlight');
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

  const handleAudienceChange = (audienceId, checked) => {
    setFormData(prev => {
      const current = Array.isArray(prev.audience) ? prev.audience : [];
      if (checked) {
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
    
    const validation = LinksService.validateLinkData(formData);
    if (!validation.isValid) {
      showToast('error', 'Validation Error', validation.errors.join(', '));
      return;
    }

    const linkData = LinksService.formatLinkData(formData);
    
    let success = false;
    if (editingLink) {
      success = await handleUpdateLink(editingLink.id, linkData);
    } else {
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

  const handleLinkClick = (link, e) => {
    if (e?.target?.closest('button')) return;
    setSelectedLink(link);
    setShowPreviewModal(true);
  };

  const handleVisitLink = (link) => {
    try {
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, viewCount: (l.viewCount || 0) + 1 } : l));
    } catch (err) {
      console.warn('Could not increment local view count', err);
    }

    LinksService.recordClick(link.id).catch(e => console.debug('recordView failed', e));

    try {
      LinksService.recordView?.(link.id).catch?.(() => {});
    } catch (e) {}

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
    return <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />;
  };

  const getCreatorLabel = (link) => {
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

  const LinkCard = ({ link }) => {
    const categoryInfo = categories.find(c => c.id === link.category);
    const CategoryIcon = categoryInfo?.icon || Globe;
    const canEdit = userData?.id && (userData.id === link.createdBy || userData.id === link.createdByUser?.id);

    return (
      <div
        className={`group relative rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
          priorityStyles[link.priority] || priorityStyles.normal
        }`}
        onClick={(e) => handleLinkClick(link, e)}
      >
        {link.priority === 'highlight' && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />
          </div>
        )}

        {isAdmin && !link.isActive && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Inactive
          </div>
        )}

        {isNewForUser(link) && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
            NEW
          </div>
        )}

        {isLinkExpiring(link.endDate) && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            Expires Soon
          </div>
        )}

        <div className="flex items-start space-x-3 sm:space-x-4 mt-6 sm:mt-0">
          <div className="flex-shrink-0">{getLinkIcon(link.category)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 pr-6">{link.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{link.description}</p>
            
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex items-center px-2 py-1 rounded-full ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{categoryInfo?.name || link.category}</span>
              </span>
              <span className="flex items-center text-gray-500">
                <Eye className="w-3 h-3 mr-1" />
                {link.viewCount || 0}
              </span>
              <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                <Target className="w-3 h-3 mr-1" />
                <span className="capitalize truncate max-w-[5rem]">{link.targetAudience}</span>
              </span>
              <span className="hidden sm:flex items-center text-gray-500">
                <Monitor className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[6rem]">{getCreatorLabel(link)}</span>
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); openEditModal(link); }}
                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                title="Edit"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleArchiveLink(link); }}
              className={`p-1 rounded ${link.isActive ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
              title={link.isActive ? "Deactivate" : "Activate"}
            >
              <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleNew(link); }}
              className={`p-1 rounded ${link.isNew ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title={link.isNew ? "Unmark New" : "Mark New"}
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); handleConfirmDelete(link); }}
                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
        <HeaderBar
          title="Special Links"
          subtitle="Quick access to important university resources and services"
          Icon={Globe}
          unread={newLinksCount}
        />

        {isAdmin && (
          <div className="mb-4 sm:mb-6 flex justify-end">
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Add New Link</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-2 pb-2 min-w-max sm:min-w-0 sm:flex-wrap">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {!loading && isAdmin && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Links</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
                </div>
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{statistics.active || 0}</p>
                </div>
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Highlighted</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {statistics.byPriority?.highlight || 0}
                  </p>
                </div>
                <Filter className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {!loading && !isAdmin && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Available</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{filteredLinks.length}</p>
                </div>
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Priority</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">{highlightedLinks.length}</p>
                </div>
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">New</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{newLinksCount}</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="max-w-3xl mx-auto">
              <LoadingComponent message="Loading links..." />
            </div>
          </div>
        ) : (
          <>
            {highlightedLinks.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Highlighted Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {highlightedLinks.map((link) => (
                    <LinkCard key={link.id} link={link} />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">All Links</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {normalLinks.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          </>
        )}

        {!loading && filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No links found</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "No special links have been added yet"}
            </p>
          </div>
        )}

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

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
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

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of what this link provides..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        required
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="normal">Normal</option>
                        <option value="highlight">⭐ Highlight</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <select
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="all">👥 All Users</option>
                        <option value="students">👨‍🎓 Students</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="newtab">🔗 New Tab</option>
                        <option value="sametab">📄 Same Tab</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingLink ? 'Update Link' : 'Create Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

        {showPreviewModal && selectedLink && (
          <LinkPreviewModal
            link={selectedLink}
            onClose={() => setShowPreviewModal(false)}
            onVisit={handleVisitLink}
            isAdmin={isAdmin}
            userData={userData}
            onEdit={openEditModal}
            onDelete={handleConfirmDelete}
            onToggleStatus={handleToggleStatus}
            onToggleNew={handleToggleNew}
          />
        )}
      </div>
    </main>
  );
}