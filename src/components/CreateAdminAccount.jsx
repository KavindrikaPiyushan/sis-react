import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Shield, Upload, Eye, EyeOff, Building, Award } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AdministrationService from "../services/super-admin/administationService";
import AdminManagementService from "../services/super-admin/adminManagementService";
import { showToast } from "../pages/utils/showToast";
import ConfirmDialog from "./ConfirmDialog";

// Move InputField outside component to prevent re-creation on every render
const InputField = React.memo(({ label, name, type = "text", required = false, icon: Icon, options, placeholder, formData, errors, handleInputChange, readOnly, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, ...props }) => (
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
          value={formData[name] || ""}
          onChange={handleInputChange}
          disabled={readOnly}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
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
          value={formData[name] || ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={readOnly}
          rows={3}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          {...props}
        />
      ) : type === "password" ? (
        <div className="relative">
          <input
            type={name === "password" ? (showPassword ? "text" : "password") : (showConfirmPassword ? "text" : "password")}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={readOnly}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            {...props}
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => name === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {(name === "password" ? showPassword : showConfirmPassword) ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={readOnly}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          {...props}
        />
      )}
    </div>
    {errors[name] && (
      <p className="text-sm text-red-600 mt-1">{errors[name]}</p>
    )}
  </div>
));

const CreateAdminAccount = ({ onBack, onSave, departments: propDepartments = [], admin: propAdmin, showConfirm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = propAdmin || location.state?.admin;
  const readOnly = location.state?.readOnly || false;
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  
  // Fetch departments if not provided
  useEffect(() => {
    const initializeDepartments = async () => {
      setDepartmentsLoading(true);
      
      // First try to use provided departments
      if (propDepartments && propDepartments.length > 0) {
        console.log("Using prop departments:", propDepartments);
        setDepartments(propDepartments);
        setDepartmentsLoading(false);
        return;
      }
      
      // Check location state departments, but skip if they're fallback/hardcoded ones
      if (location.state?.departments && location.state.departments.length > 0) {
        const stateDepartments = location.state.departments;
        console.log("Location state departments:", stateDepartments);
        
        // Check if these are the fallback departments from AdminAccounts
        const isFallbackData = stateDepartments.some(dept => 
          dept.name === "IT Department" || dept.name === "Academic Affairs" || dept.name === "Finance"
        );
        
        if (!isFallbackData) {
          console.log("Using location state departments (not fallback):", stateDepartments);
          setDepartments(stateDepartments);
          setDepartmentsLoading(false);
          return;
        } else {
          console.log("Skipping fallback departments from AdminAccounts, fetching fresh from API");
        }
      }
      
      // Fetch from API (either no departments provided or fallback departments detected)
      try {
        console.log("Fetching departments from API...");
        const response = await AdministrationService.fetchAllDepartments();
        console.log("Department API response:", response);
        
        if (response && response.success && response.data && Array.isArray(response.data)) {
          console.log("Setting departments from API:", response.data);
          setDepartments(response.data);
        } else if (response && Array.isArray(response)) {
          console.log("Setting departments directly from response:", response);
          setDepartments(response);
        } else {
          console.warn("Unexpected departments response format:", response);
          // Fallback departments matching your API format
          const fallbackDepts = [
            // { id: "dep-001", name: "Department of Computer Science" },
            // { id: "dep-002", name: "Department of Mathematics" },
            // { id: "dep-003", name: "Department of Physics" },
          ];
          console.log("Using fallback departments:", fallbackDepts);
          setDepartments(fallbackDepts);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        // Fallback departments on error matching your API format
        const fallbackDepts = [
          { id: "dep-001", name: "Department of Computer Science" },
          { id: "dep-002", name: "Department of Mathematics" },
          { id: "dep-003", name: "Department of Physics" },
        ];
        console.log("Using fallback departments due to error:", fallbackDepts);
        setDepartments(fallbackDepts);
      } finally {
        setDepartmentsLoading(false);
      }
    };
    
    initializeDepartments();
  }, []); // Empty dependency array - only run once on mount
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: admin?.firstName || "",
    lastName: admin?.lastName || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    dateOfBirth: admin?.dateOfBirth || "",
    gender: admin?.gender || "",
    address: admin?.address || "",

    
    // Administrative Information
    adminId: admin?.adminId || admin?.lecturerId || "",
    department: admin?.departmentId || admin?.department || "", // Use departmentId first, then fallback to department
    position: admin?.position || "",
    hireDate: admin?.hireDate || "",
    supervisor: admin?.supervisor || "",
    accessLevel: admin?.accessLevel || "",
    permissions: admin?.permissions || [],
    
    // Account Information
    username: admin?.username || "",
    password: "",
    confirmPassword: "",
    
    // Professional Information
    education: admin?.education || "",
    experience: admin?.experience || "",
    specialization: admin?.specialization || "",
    certifications: admin?.certifications || "",
    
    // Emergency Contact
    emergencyContact: admin?.emergencyContact || "",
    emergencyPhone: admin?.emergencyPhone || "",
    
    // Profile Picture
    profilePicture: null
  });

  // If editing, update formData when admin changes
  useEffect(() => {
    if (admin) {
      setFormData(prev => ({
        ...prev,
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        email: admin.email || "",
        phone: admin.phone || "",
        dateOfBirth: admin.dateOfBirth || "",
        gender: admin.gender || "",
        address: admin.address || "",
        adminId: admin.adminId || admin.lecturerId || "",
        department: admin.departmentId || admin.department || "", // Use departmentId first, then fallback to department
        position: admin.position || "",
        username: admin.username || "",
        emergencyContact: admin.emergencyContact || "",
        emergencyPhone: admin.emergencyPhone || "",
      }));
    }
  }, [admin]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        return {
          ...prev,
          [name]: ""
        };
      }
      return prev;
    });
  }, []); // No dependencies needed since we use functional state updates

  const handlePermissionChange = useCallback((permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Only required fields: email, departmentId (department), and lecturerId (adminId)
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.adminId.trim()) newErrors.adminId = "Lecturer ID is required";
    if (!formData.department) newErrors.department = "Department is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Optional password validation (only if provided)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Optional phone validation (only if provided)
    const phoneRegex = /^[\+]?[0-9][\d\s\-]{8,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data in the format expected by the API
    const apiData = {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email,
      password: formData.password || "admin123", // Default password if not provided
      role: "admin",
      departmentId: formData.department,
      lecturerId: formData.adminId,
      phone: formData.phone || "",
      address: formData.address || "",
      dateOfBirth: formData.dateOfBirth || "",
      emergencyContactName: formData.emergencyContact || "",
      emergencyContactPhone: formData.emergencyPhone || "",
    };
    
    // Store the API data for confirmation
    setPendingSubmit(apiData);
    
    // Show confirmation dialog
    if (showConfirm) {
      showConfirm(
        admin ? "Update Admin Account" : "Create Admin Account",
        admin 
          ? `Are you sure you want to update the admin account for ${formData.firstName} ${formData.lastName}?`
          : `Are you sure you want to create a new admin account for ${formData.firstName} ${formData.lastName}?`,
        () => performSubmit(apiData)
      );
    } else {
      // Fallback to local confirm dialog if showConfirm is not available
      setConfirmOpen(true);
    }
  };
  
  const performSubmit = async (apiData) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting admin data:", apiData);
      
      let response;
      
      if (admin && admin.id) {
        // Editing existing admin - call updateAdmin API
        console.log("Updating existing admin with ID:", admin.id);
        response = await AdminManagementService.updateAdmin(admin.id, apiData);
      } else {
        // Creating new admin - call createAdmin API
        console.log("Creating new admin");
        response = await AdminManagementService.createAdmin(apiData);
      }
      
      console.log("API response:", response);
      
      if (response && response.success) {
        showToast(
          "success",
          "Success", 
          admin ? "Admin account updated successfully!" : "Admin account created successfully!"
        );
        
        // Call onSave callback if provided (for parent component updates)
        if (onSave) {
          onSave(response.data);
        }
        
        // Navigate back after successful creation/update
        navigate(-1);
      } else {
        throw new Error(response?.message || "Failed to save admin account");
      }
      
    } catch (error) {
      console.error("Error saving admin account:", error);
      showToast(
        "error",
        "Error",
        `Failed to ${admin ? 'update' : 'create'} admin account: ${error.message || 'Please try again.'}`
      );
    } finally {
      setIsSubmitting(false);
      setPendingSubmit(null);
    }
  };
  
  const handleConfirmSubmit = () => {
    if (pendingSubmit) {
      performSubmit(pendingSubmit);
    }
    setConfirmOpen(false);
  };
  
  const handleCancelSubmit = () => {
    setConfirmOpen(false);
    setPendingSubmit(null);
  };

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

  // Debug: Log departments state
  console.log("Current departments state:", departments);
  console.log("Departments length:", departments.length);

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
            {readOnly ? "View Admin Account" : admin ? "Edit Admin Account" : "Create New Admin Account"}
          </h1>
          <p className="text-blue-100 mt-2">
            {readOnly ? "Administrator account details" : admin ? "Update administrator information" : "Fill in the administrator information to create a new account"}
          </p>
        </div>

        <div className="p-8 space-y-8">
         

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                icon={User}
                placeholder="Enter first name"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Last Name"
                name="lastName"
                icon={User}
                placeholder="Enter last name"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                required
                icon={Mail}
                placeholder="Enter email address"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                icon={Phone}
                placeholder="Enter phone number"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                icon={Calendar}
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Gender"
                name="gender"
                type="select"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" }
                ]}
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Address"
                name="address"
                type="textarea"
                icon={MapPin}
                placeholder="Enter full address"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
            
            </div>
          </div>

          {/* Administrative Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Administrative Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Lecturer ID"
                name="adminId"
                required
                icon={Shield}
                placeholder="Enter lecturer ID (e.g., L001)"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Department"
                name="department"
                type="select"
                required
                icon={Building}
                options={departments.map(dept => {
                  console.log("Mapping department:", dept);
                  return {
                    value: dept.id,
                    label: dept.name
                  };
                })}
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />         
            </div>
          </div>

          {/* Permissions
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
          </div> */}

          {/* Account Information - Only show when creating new admin (not editing) */}
          {!admin && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Account Credentials (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Username"
                  name="username"
                  icon={User}
                  placeholder="Enter username (optional)"
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  readOnly={readOnly}
                />
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter password (optional, min. 6 characters)"
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  readOnly={readOnly}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />
              </div>
            </div>
          )}

          {/* Professional Information */}
          {/* <div>
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
          </div> */}

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Emergency Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Emergency Contact Name"
                name="emergencyContact"
                icon={User}
                placeholder="Enter contact name"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
              <InputField
                label="Emergency Contact Phone"
                name="emergencyPhone"
                type="tel"
                icon={Phone}
                placeholder="Enter contact phone"
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack || (() => navigate(-1))}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              {readOnly ? "Back" : "Cancel"}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {admin ? "Updating Account..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {admin ? "Update Admin Account" : "Create Admin Account"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Local Confirm Dialog - fallback if showConfirm prop not available */}
      <ConfirmDialog
        open={confirmOpen}
        title={admin ? "Update Admin Account" : "Create Admin Account"}
        message={admin 
          ? `Are you sure you want to update the admin account for ${formData.firstName} ${formData.lastName}?`
          : `Are you sure you want to create a new admin account for ${formData.firstName} ${formData.lastName}?`
        }
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </div>
  );
};

export default CreateAdminAccount;