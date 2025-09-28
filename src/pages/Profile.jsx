import { useEffect, useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImage';
import AuthService from '../services/authService';
import {
  UserCog,
  Save,
  X,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  User,
  BadgeCheck,
  Cake,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import branding from '../config/branding';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [profileImage, setProfileImage] = useState(null); // for preview
  const [profileImageFile, setProfileImageFile] = useState(null); // for upload
  const fileInputRef = useRef();
  // Cropping states
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImage, setRawImage] = useState(null); // original file for cropping
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await AuthService.getProfile();
      if (res.success) {
        setProfile(res.data);
        setEditData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
        // Prefer profileImage, fallback to profileImageUrl, fallback to null
        setProfileImage(res.data.profileImage || res.data.profileImageUrl || null);
      } else {
        showAlert(res.message || 'Failed to fetch profile', 'error');
      }
    } catch (e) {
      showAlert('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      address: profile.address || '',
    });
  setProfileImage(profile.profileImageUrl || null);
  setProfileImageFile(null);
  setRawImage(null);
  setShowCrop(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Dynamically choose upload strategy based on config
      const uploadConfig = (await import('../config/upload')).default;
      let res;
      if (uploadConfig.UPLOAD_DRIVER === 's3' && uploadConfig.S3_IS_PRE_SIGNED) {
        // S3 pre-signed: send plain object
        const payload = { ...editData };
        if (profileImageFile) payload.profileImageFile = profileImageFile;
        console.log('Uploading profile image to S3 with pre-signed URL:', profileImageFile);
        console.log('Profile data being sent (plain object):', payload);
        res = await AuthService.updateProfile(payload);
      } else {
        // Local or direct S3: use FormData
        const formData = new FormData();
        Object.entries(editData).forEach(([k, v]) => formData.append(k, v));
        if (profileImageFile) {
          formData.append('profileImage', profileImageFile);
          console.log('Uploading profile image (FormData):', profileImageFile);
        }
        console.log('Profile data being sent (FormData):', formData);
        res = await AuthService.updateProfile(formData);
      }
      if (res.success) {
        showAlert('Profile updated successfully', 'success');
        setIsEditing(false);
        setProfileImageFile(null);
        setRawImage(null);
        setShowCrop(false);
        fetchProfile();
      } else {
        showAlert(res.message || 'Failed to update profile', 'error');
      }
    } catch (e) {
      showAlert('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cropping logic
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(rawImage, croppedAreaPixels);
    setProfileImage(URL.createObjectURL(croppedBlob));
    setProfileImageFile(new File([croppedBlob], 'profile.jpg', { type: croppedBlob.type }));
    setShowCrop(false);
  };

  // Change password logic
  const handleSendOtp = async () => {
    setChangePwdLoading(true);
    try {
      const res = await AuthService.sendChangePasswordOtp();
      if (res.success) {
        setOtpSent(true);
        showAlert('OTP sent to your email.', 'success');
      } else {
        showAlert(res.message || 'Failed to send OTP', 'error');
      }
    } catch (e) {
      showAlert('Network error', 'error');
    } finally {
      setChangePwdLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !otp) {
      showAlert('Please fill all password fields and OTP.', 'error');
      return;
    }
    setChangePwdLoading(true);
    try {
      const res = await AuthService.changePassword(currentPassword, newPassword, otp);
      if (res.success) {
        showAlert('Password changed successfully', 'success');
        setShowChangePassword(false);
        setOtpSent(false);
        setCurrentPassword('');
        setNewPassword('');
        setOtp('');
      } else {
        showAlert(res.message || 'Failed to change password', 'error');
      }
    } catch (e) {
      showAlert('Network error', 'error');
    } finally {
      setChangePwdLoading(false);
    }
  };


  // Modal dialog root
  if (!showChangePassword && !isEditing && !profile) {
    // Only show loading overlay if not in modal
    if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"><div className="bg-white rounded-2xl px-8 py-6 shadow-xl text-center">Loading...</div></div>;
  }

  // Show as popup dialog overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
        {/* Close button */}
        <button className="absolute top-5 right-5 text-gray-400 hover:text-red-500 text-xl z-10 p-2 rounded-xl transition-all duration-300 hover:bg-gray-100/80" onClick={() => window.history.back()}>
          <X className="w-6 h-6" />
        </button>

        {/* Branding Header */}
        <div className="flex items-center gap-4 px-8 py-6 bg-gradient-to-r from-blue-800 to-blue-600 text-white border-b border-blue-900">
          {branding.logo && (
            <img src={branding.logo} alt="Logo" className="h-12 w-12 rounded-full bg-white p-1 shadow" />
          )}
          <div>
            <div className="text-lg font-bold tracking-wide">{branding.university || 'University'}</div>
            <div className="text-sm opacity-80">{branding.faculty || 'Faculty'} - {branding.systemName || 'Student Information System'}</div>
          </div>
        </div>

        <div className="px-8 py-8">
          <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-2 text-blue-900">
            <User className="inline-block text-blue-700" /> Profile
          </h2>
          {alert.show && (
            <div className={`mb-4 p-3 rounded text-sm font-medium flex items-center gap-2 ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {alert.type === 'success' ? <CheckCircle2 /> : <XCircle />} {alert.message}
            </div>
          )}
          {/* Profile Image Section */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={profileImage || profile?.profileImage || profile?.profileImageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((profile?.firstName || '') + ' ' + (profile?.lastName || ''))}
                alt="Profile"
                className="h-24 w-24 rounded-full border-4 border-blue-200 object-cover shadow"
              />
              {isEditing && (
                <>
                  <button
                    className="absolute bottom-0 right-0 bg-blue-700 text-white rounded-full p-2 shadow hover:bg-blue-800 transition"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    title="Change profile image"
                  >
                    <UserCog className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setRawImage(file);
                        setShowCrop(true);
                      }
                    }}
                  />
      {/* Crop Modal */}
      {showCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl" onClick={() => setShowCrop(false)}>
              <X />
            </button>
            <h3 className="text-lg font-bold mb-4">Crop Profile Image</h3>
            <div className="relative w-full h-72 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={rawImage ? URL.createObjectURL(rawImage) : null}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex gap-4 mt-4 items-center">
              <label className="text-sm">Zoom</label>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={() => setShowCrop(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-700 text-white rounded-lg" onClick={handleCropConfirm}>Crop & Save</button>
            </div>
          </div>
        </div>
      )}
                </>
              )}
            </div>
            <div>
              <div className="font-semibold text-blue-900 text-lg">{profile?.firstName} {profile?.lastName}</div>
              <div className="text-gray-500 text-sm">{profile?.email}</div>
            </div>
          </div>
          {profile && !isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8">
              <div className="flex items-center gap-2"><User className="text-blue-700" /><span className="font-semibold">Name:</span> {profile.firstName} {profile.lastName}</div>
              <div className="flex items-center gap-2"><Mail className="text-blue-700" /><span className="font-semibold">Email:</span> {profile.email}</div>
              <div className="flex items-center gap-2"><BadgeCheck className="text-blue-700" /><span className="font-semibold">Role:</span> {profile.role}</div>
              <div className="flex items-center gap-2"><BadgeCheck className="text-blue-700" /><span className="font-semibold">Student ID:</span> {profile.studentNo || '-'}</div>
              <div className="flex items-center gap-2"><Phone className="text-blue-700" /><span className="font-semibold">Phone:</span> {profile.phone || '-'}</div>
              <div className="flex items-center gap-2"><MapPin className="text-blue-700" /><span className="font-semibold">Address:</span> {profile.address || '-'}</div>
              <div className="flex items-center gap-2"><Cake className="text-blue-700" /><span className="font-semibold">Date of Birth:</span> {profile.dateOfBirth ? profile.dateOfBirth.slice(0,10) : '-'}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className={profile.isActive ? 'text-green-600' : 'text-gray-400'} /><span className="font-semibold">Active:</span> {profile.isActive ? 'Yes' : 'No'}</div>
            </div>
          )}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-8">
              <div>
                <label className="block mb-1 font-semibold text-blue-900">First Name</label>
                <input className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-blue-50" value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-blue-900">Last Name</label>
                <input className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-blue-50" value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-blue-900">Phone</label>
                <input className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-blue-50" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold text-blue-900">Address</label>
                <input className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-blue-50" value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} />
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mb-4">
            {!isEditing && (
              <button className="flex items-center gap-2 px-5 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition" onClick={handleEdit}>
                <UserCog /> Edit Profile
              </button>
            )}
            {isEditing && <>
              <button className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition" onClick={handleSave}>
                <Save /> Save
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition" onClick={handleCancelEdit}>
                <X /> Cancel
              </button>
            </>}
            <button className="flex items-center gap-2 px-5 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition" onClick={() => setShowChangePassword(true)}>
              <KeyRound /> Change Password
            </button>
          </div>

          {/* Change Password Modal */}
          {showChangePassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl" onClick={() => { setShowChangePassword(false); setOtpSent(false); setCurrentPassword(''); setNewPassword(''); setOtp(''); }}>
                  <X />
                </button>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900"><KeyRound className="text-yellow-600" /> Change Password</h3>
                {!otpSent && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 mb-4 transition" onClick={handleSendOtp} disabled={changePwdLoading}>
                    <Mail /> {changePwdLoading ? 'Sending OTP...' : 'Send OTP to Email'}
                  </button>
                )}
                {otpSent && (
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 font-semibold text-blue-900">Current Password</label>
                      <input type="password" className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-blue-50" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-blue-900">New Password</label>
                      <input type="password" className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-blue-50" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-blue-900">OTP</label>
                      <input className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-blue-50" value={otp} onChange={e => setOtp(e.target.value)} />
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition" onClick={handleChangePassword} disabled={changePwdLoading}>
                      <Save /> {changePwdLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );


}

export default Profile;
