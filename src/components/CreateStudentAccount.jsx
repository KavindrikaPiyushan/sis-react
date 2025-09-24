import React, { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, BookOpen, Eye, EyeOff } from "lucide-react";
import StudentManagementService from "../services/super-admin/studentManagementService";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../pages/utils/showToast.jsx";

// Define InputField as a separate component outside the main component
const InputField = React.memo(({ 
  label, 
  name, 
  type = "text", 
  required = false, 
  icon: Icon, 
  options, 
  placeholder, 
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  readOnly,
  ...props
}) => (
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
          value={value || ""}
          onChange={onChange}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
          disabled={readOnly}
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
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 resize-none ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
          disabled={readOnly}
          {...props}
        />
      ) : type === "password" ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            }`}
            disabled={readOnly}
            {...props}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={readOnly}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
          disabled={readOnly}
          {...props}
        />
      )}
    </div>
    {error && (
      <p className="text-sm text-red-600 mt-1">{error}</p>
    )}
  </div>
));

const CreateStudentAccount = ({ onBack, onSave, batchPrograms = [], student: propStudent }) => {
  const location = useLocation();
  const student = propStudent || location.state?.student;
  const readOnly = location.state?.readOnly || false;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    dateOfBirth: student?.dateOfBirth || "",
    gender: student?.gender || "",
    address: student?.address || "",
    studentId: student?.studentId || "",
    program: student?.program || "",
    parentName: student?.parentName || "",
    parentPhone: student?.parentPhone || "",
    emergencyContact: student?.emergencyContact || "",
    emergencyPhone: student?.emergencyPhone || "",
    uniRegistrationDate: student?.uniRegistrationDate || ""
  });

  // If editing, update formData when student changes
  React.useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        dateOfBirth: student.dateOfBirth || "",
        gender: student.gender || "",
        address: student.address || "",
        studentId: student.studentId || "",
        program: student.program || "",
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        emergencyContact: student.emergencyContact || "",
        emergencyPhone: student.emergencyPhone || "",
        uniRegistrationDate: student.uniRegistrationDate || ""
      });
    }
  }, [student]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Notification state removed, using react-toastify

  // Use useCallback to prevent re-creation on every render
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    if (!formData.program) newErrors.program = "Program is required";

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Accepts numbers like 0774445555, +94774445555, 94774445555
    const phoneRegex = /^(?:0\d{9}|(?:\+94|94)\d{9})$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: "student",
        studentId: formData.studentId,
        batchId: formData.program,
        gender: formData.gender,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        emergencyContactName: formData.emergencyContact,
        emergencyContactPhone: formData.emergencyPhone,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        uniRegistrationDate: formData.uniRegistrationDate
      };
      let result;
      if (student && student.id) {
        // Edit mode
        result = await StudentManagementService.editStudent(student.id, payload);
      } else {
        // Create mode
        result = await StudentManagementService.createStudent(payload);
      }
      if (result && result.data) {
        if (onSave) onSave(payload);
        showToast("success", student ? "Updated" : "Success", `Student account ${student ? "updated" : "created"} successfully!`);
        setTimeout(() => {
          navigate("/admin/student-accounts");
        }, 1200);
      } else {
        const errorMsg = result?.message || (result?.errors?.[0]?.message) || `Error ${student ? "updating" : "creating"} student account. Please try again.`;
        showToast("error", "Error", errorMsg);
      }
    } catch (error) {
      let errorMsg = `Error ${student ? "updating" : "creating"} student account. Please try again.`;
      if (error?.response?.data) {
        errorMsg = error.response.data.message || (error.response.data.errors?.[0]?.message) || errorMsg;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      showToast("error", "Error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave, student, navigate]);




  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Student Accounts
          </button>
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
              <h1 className="text-2xl font-bold text-white">
                {readOnly
                  ? "Student Account"
                  : student
                  ? "Edit Student Account"
                  : "Create New Student Account"}
              </h1>
              <p className="text-indigo-100 mt-2">
                {readOnly
                  ? "View all student details below."
                  : student
                  ? "Update the student information below."
                  : "Fill in the student information to create a new account"}
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
                    required
                    icon={User}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    required
                    icon={User}
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    icon={Mail}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    required
                    icon={Phone}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    required
                    icon={Calendar}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    error={errors.dateOfBirth}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Gender"
                    name="gender"
                    type="select"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    error={errors.gender}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" }
                    ]}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Address"
                    name="address"
                    type="textarea"
                    icon={MapPin}
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    readOnly={readOnly}
                  />
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
                    value={formData.studentId}
                    onChange={handleInputChange}
                    error={errors.studentId}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="University Registration Date"
                    name="uniRegistrationDate"
                    type="date"
                    icon={Calendar}
                    value={formData.uniRegistrationDate}
                    onChange={handleInputChange}
                    error={errors.uniRegistrationDate}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Batch Program"
                    name="program"
                    type="select"
                    required
                    icon={BookOpen}
                    value={formData.program}
                    onChange={handleInputChange}
                    error={errors.program}
                    options={batchPrograms.map((program) => ({
                      value: program.id,
                      label: program.name
                    }))}
                    readOnly={readOnly}
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
                    value={formData.parentName}
                    onChange={handleInputChange}
                    error={errors.parentName}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Parent/Guardian Phone"
                    name="parentPhone"
                    type="tel"
                    icon={Phone}
                    placeholder="Enter parent/guardian phone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    error={errors.parentPhone}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Emergency Contact Name"
                    name="emergencyContact"
                    icon={User}
                    placeholder="Enter emergency contact name"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    error={errors.emergencyContact}
                    readOnly={readOnly}
                  />
                  <InputField
                    label="Emergency Contact Phone"
                    name="emergencyPhone"
                    type="tel"
                    icon={Phone}
                    placeholder="Enter emergency contact phone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    error={errors.emergencyPhone}
                    readOnly={readOnly}
                  />
                </div>
              </div>

              {/* Submit Button */}
              {!readOnly && (
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
                        {student ? "Update Student Account" : "Create Student Account"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentAccount;