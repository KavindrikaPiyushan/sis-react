import React, { useState } from "react";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Shield, Upload, Eye, EyeOff, Building, Award } from "lucide-react";

const CreateAdminAccount = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    
    // Administrative Information
    adminId: "",
    department: "",
    position: "",
    hireDate: "",
    supervisor: "",
    accessLevel: "",
    permissions: [],
    
    // Account Information
    username: "",
    password: "",
    confirmPassword: "",
    
    // Professional Information
    education: "",
    experience: "",
    specialization: "",
    certifications: "",
    
    // Emergency Contact
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelation: "",
    
    // Profile Picture
    profilePicture: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.adminId.trim()) newErrors.adminId = "Admin ID is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.position) newErrors.position = "Position is required";
    if (!formData.accessLevel) newErrors.accessLevel = "Access level is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSave) {
        onSave(formData);
      }
      
      alert("Admin account created successfully!");
      
    } catch (error) {
      alert("Error creating admin account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, name, type = "text", required = false, icon: Icon, options, placeholder, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        {type === "select" ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            }`}
            {...props}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={3}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            }`}
            {...props}
          />
        ) : type === "password" ? (
          <div className="relative">
            <input
              type={name === "password" ? (showPassword ? "text" : "password") : (showConfirmPassword ? "text" : "password")}
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
              {...props}
            />
            <button
              type="button"
              onClick={() => name === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {(name === "password" ? showPassword : showConfirmPassword) ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            }`}
            {...props}
          />
        )}
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600 mt-1">{errors[name]}</p>
      )}
    </div>
  );

  const permissionOptions = [
    { id: "user-management", label: "User Management" },
    { id: "student-records", label: "Student Records" },
    { id: "financial-management", label: "Financial Management" },
    { id: "academic-management", label: "Academic Management" },
    { id: "system-settings", label: "System Settings" },
    { id: "reports-analytics", label: "Reports & Analytics" },
    { id: "course-management", label: "Course Management" },
    { id: "staff-management", label: "Staff Management" }
  ];

  return (
    <div className="">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Accounts
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Create New Admin Account
          </h1>
          <p className="text-blue-100 mt-2">Fill in the administrator information to create a new account</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {formData.profilePicture ? (
                  <img
                    src={URL.createObjectURL(formData.profilePicture)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-600">Upload profile picture (optional)</p>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                required
                icon={User}
                placeholder="Enter first name"
              />
              <InputField
                label="Last Name"
                name="lastName"
                required
                icon={User}
                placeholder="Enter last name"
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                required
                icon={Mail}
                placeholder="Enter email address"
              />
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                required
                icon={Phone}
                placeholder="Enter phone number"
              />
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                required
                icon={Calendar}
              />
              <InputField
                label="Gender"
                name="gender"
                type="select"
                required
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" }
                ]}
              />
              <InputField
                label="Address"
                name="address"
                type="textarea"
                icon={MapPin}
                placeholder="Enter full address"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  name="city"
                  placeholder="Enter city"
                />
                <InputField
                  label="State"
                  name="state"
                  placeholder="Enter state"
                />
              </div>
            </div>
          </div>

          {/* Administrative Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Administrative Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Admin ID"
                name="adminId"
                required
                icon={Shield}
                placeholder="Enter admin ID"
              />
              <InputField
                label="Department"
                name="department"
                type="select"
                required
                icon={Building}
                options={[
                  { value: "academic-affairs", label: "Academic Affairs" },
                  { value: "student-services", label: "Student Services" },
                  { value: "finance", label: "Finance & Administration" },
                  { value: "human-resources", label: "Human Resources" },
                  { value: "it", label: "Information Technology" },
                  { value: "admissions", label: "Admissions" },
                  { value: "registrar", label: "Registrar" }
                ]}
              />
              <InputField
                label="Position"
                name="position"
                type="select"
                required
                options={[
                  { value: "super-admin", label: "Super Administrator" },
                  { value: "department-admin", label: "Department Administrator" },
                  { value: "system-admin", label: "System Administrator" },
                  { value: "academic-admin", label: "Academic Administrator" },
                  { value: "student-admin", label: "Student Administrator" }
                ]}
              />
              <InputField
                label="Hire Date"
                name="hireDate"
                type="date"
                icon={Calendar}
              />
              <InputField
                label="Access Level"
                name="accessLevel"
                type="select"
                required
                icon={Shield}
                options={[
                  { value: "level-1", label: "Level 1 - Basic Access" },
                  { value: "level-2", label: "Level 2 - Moderate Access" },
                  { value: "level-3", label: "Level 3 - Full Access" },
                  { value: "super", label: "Super Admin - Complete Access" }
                ]}
              />
              <InputField
                label="Direct Supervisor"
                name="supervisor"
                placeholder="Enter supervisor name"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              System Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissionOptions.map((permission) => (
                <label key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{permission.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Account Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Username"
                name="username"
                required
                icon={User}
                placeholder="Enter username"
              />
              <div></div>
              <InputField
                label="Password"
                name="password"
                type="password"
                required
                placeholder="Enter password (min. 8 characters)"
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Highest Education"
                name="education"
                icon={Award}
                placeholder="Enter education background"
              />
              <InputField
                label="Years of Experience"
                name="experience"
                type="number"
                placeholder="Enter years of experience"
              />
              <InputField
                label="Area of Specialization"
                name="specialization"
                placeholder="Enter specialization area"
              />
              <InputField
                label="Certifications"
                name="certifications"
                type="textarea"
                placeholder="Enter relevant certifications"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Emergency Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Emergency Contact Name"
                name="emergencyContact"
                icon={User}
                placeholder="Enter contact name"
              />
              <InputField
                label="Emergency Contact Phone"
                name="emergencyPhone"
                type="tel"
                icon={Phone}
                placeholder="Enter contact phone"
              />
              <InputField
                label="Relationship"
                name="emergencyRelation"
                placeholder="Enter relationship"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Admin Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminAccount;