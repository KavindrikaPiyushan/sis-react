import React, { useState } from "react";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, BookOpen, Upload, Eye, EyeOff } from "lucide-react";

const CreateStudentAccount = ({ onBack, onSave }) => {
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
    
    // Academic Information
    studentId: "",
    enrollmentDate: "",
    program: "",
    year: "",
    semester: "",
    advisor: "",
    
    // Account Information
    username: "",
    password: "",
    confirmPassword: "",
    
    // Additional Information
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    emergencyContact: "",
    emergencyPhone: "",
    
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
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    if (!formData.program) newErrors.program = "Program is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      
      alert("Student account created successfully!");
      
    } catch (error) {
      alert("Error creating student account. Please try again.");
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
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
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
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 resize-none ${
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
              className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
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
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
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

  return (
    <div className=""> <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2  py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Student Accounts
          </button>
        </div>
      <div >
        {/* Header */}
       

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Create New Student Account</h1>
            <p className="text-indigo-100 mt-2">Fill in the student information to create a new account</p>
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

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Student ID"
                  name="studentId"
                  required
                  placeholder="Enter student ID"
                />
                <InputField
                  label="Registration Date"
                  name="enrollmentDate"
                  type="date"
                  icon={Calendar}
                />
                <InputField
                  label="Program"
                  name="program"
                  type="select"
                  required
                  icon={BookOpen}
                  options={[
                    { value: "computer-science", label: "Computer Science" },
                    { value: "business", label: "Business Administration" },
                    { value: "engineering", label: "Engineering" },
                    { value: "medicine", label: "Medicine" },
                    { value: "arts", label: "Liberal Arts" }
                  ]}
                />
                <InputField
                  label="Academic Year"
                  name="year"
                  type="select"
                  options={[
                    { value: "1", label: "1st Year" },
                    { value: "2", label: "2nd Year" },
                    { value: "3", label: "3rd Year" },
                    { value: "4", label: "4th Year" }
                  ]}
                />
                <InputField
                  label="Current Semester"
                  name="semester"
                  type="select"
                  options={[
                    { value: "fall-2024", label: "Fall 2024" },
                    { value: "spring-2025", label: "Spring 2025" },
                    { value: "summer-2025", label: "Summer 2025" }
                  ]}
                />
               
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
                  placeholder="Enter password"
                />
             
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Emergency Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Parent/Guardian Name"
                  name="parentName"
                  icon={User}
                  placeholder="Enter parent/guardian name"
                />
                <InputField
                  label="Parent/Guardian Phone"
                  name="parentPhone"
                  type="tel"
                  icon={Phone}
                  placeholder="Enter parent/guardian phone"
                />
                <InputField
                  label="Emergency Contact Name"
                  name="emergencyContact"
                  icon={User}
                  placeholder="Enter emergency contact name"
                />
                <InputField
                  label="Emergency Contact Phone"
                  name="emergencyPhone"
                  type="tel"
                  icon={Phone}
                  placeholder="Enter emergency contact phone"
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
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Student Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentAccount;