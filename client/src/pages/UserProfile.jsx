import { useState, useEffect } from "react";
import Layout from "../layouts/Layouts";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfileAction, changePasswordAction } from "../Redux/Actions/User";
import { SpinnerLoading } from "../components/Spinner";
import Toast from "../components/Toast";
import { clearProfileError } from "../Redux/Actions/User";

const ProfileField = ({ label, value, isEditing, onEdit, onSave, onCancel, onChange, inputType = "text", disabled = false, passwordSectionOpen = false }) => (
   <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
         <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</label>
         {!isEditing && (
            <button
               onClick={onEdit}
               disabled={disabled || passwordSectionOpen}
               className={`text-fuchsia-800 dark:text-fuchsia-600 px-3 py-1 text-sm transition-opacity ${
                  (disabled || passwordSectionOpen) ? 'opacity-50 cursor-not-allowed hover:text-fuchsia-800 dark:hover:text-fuchsia-600' : 'hover:text-fuchsia-900'
               }`}
            >
               {value && value !== "Not added" ? "Edit" : "+ Add"}
            </button>
         )}
      </div>
      {isEditing ? (
         <div className="flex flex-col gap-2">
            {inputType === "textarea" ? (
               <textarea
                  value={value}
                  onChange={onChange}
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-fuchsia-700 focus:border-fuchsia-700 outline-none"
               />
            ) : (
               <input
                  type="text"
                  value={value}
                  onChange={onChange}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-fuchsia-700 focus:border-fuchsia-700 outline-none"
               />
            )}
            <div className="flex gap-2">
               <button
                  onClick={onSave}
                  className="px-3 py-1 bg-fuchsia-800 text-white rounded hover:bg-fuchsia-900 text-sm flex-1 md:flex-none"
               >
                  Save
               </button>
               <button
                  onClick={onCancel}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm flex-1 md:flex-none"
               >
                  Cancel
               </button>
            </div>
         </div>
      ) : (
         <p className="text-gray-900 dark:text-white">{value || "Not set"}</p>
      )}
   </div>
);

const PasswordSection = ({ show, onToggle, passwordData, setPasswordData, onSubmit, disabled }) => (
   <div className="md:col-span-2 mt-8 mb-4">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Password Settings</h3>
         <button
            onClick={() => {
               if (!show) {
                  onToggle();
               } else {
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  onToggle();
               }
            }}
            className={`text-fuchsia-800 hover:text-fuchsia-900 dark:text-fuchsia-600 px-3 py-1 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
         >
            {show ? "Cancel" : "Change Password"}
         </button>
      </div>
      {show && (
         <form onSubmit={onSubmit} className="space-y-4 max-w-md">
            {["Current Password", "New Password", "Confirm New Password"].map((label, index) => (
               <div key={label}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                     {label}
                  </label>
                  <input
                     type="password"
                     value={passwordData[Object.keys(passwordData)[index]]}
                     onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        [Object.keys(passwordData)[index]]: e.target.value
                     }))}
                     className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-fuchsia-700 focus:border-fuchsia-700 outline-none"
                     required
                  />
               </div>
            ))}
            <button
               type="submit"
               className="w-full text-gray-100 bg-fuchsia-800 hover:bg-fuchsia-900 focus:ring-4 focus:ring-fuchsia-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
               Change Password
            </button>
         </form>
      )}
   </div>
);

export default function UserProfile() {
   const [formData, setFormData] = useState({
      name: "", mobile: "", address: "", pincode: ""
   });
   const [editMode, setEditMode] = useState({});
   const [showPasswordSection, setShowPasswordSection] = useState(false);
   const [passwordData, setPasswordData] = useState({
      currentPassword: "", newPassword: "", confirmPassword: ""
   });
   const [message, setMessage] = useState({ text: "", type: "" });
   const [activeEditField, setActiveEditField] = useState(null);

   const { userInfo } = useSelector((state) => state.userLoginReducer);
   const { loading, error } = useSelector((state) => state.userProfileUpdateReducer);
   const dispatch = useDispatch();

   useEffect(() => {
      return () => {
         dispatch(clearProfileError());
      };
   }, [dispatch]);

   useEffect(() => {
      if (userInfo) {
         setFormData({
            name: userInfo.name || "",
            mobile: userInfo.mobNum || "",  // Note: mapping mobNum to mobile
            address: userInfo.address || "",
            pincode: userInfo.pincode || ""
         });
      }
   }, [userInfo]);

   useEffect(() => {
      if (error) {
         setMessage({ text: error, type: "error" });
         const timer = setTimeout(() => setMessage({ text: "", type: "" }), 2000);
         return () => clearTimeout(timer);
      }
   }, [error]);

   const handleEdit = (field) => {
      if (activeEditField) return; // Prevent opening multiple edit forms
      if (showPasswordSection) return; // Prevent editing if password section is open

      if (["mobile", "address", "pincode"].includes(field)) {
         setFormData(prev => ({
            ...prev,
            [field]: prev[field] === "Not added" ? "" : prev[field]
         }));
      }
      setActiveEditField(field);
      setEditMode(prev => ({ ...prev, [field]: true }));
   };

   const handleCancel = (field) => {
      setActiveEditField(null);
      setEditMode(prev => ({ ...prev, [field]: false }));

      if (userInfo) {
         setFormData(prev => ({
            ...prev,
            [field]: field === "mobile" ? userInfo.mobNum || "" : userInfo[field] || ""
         }));
      }
   };

   const validateUsername = (name) => {
      return /^[A-Za-z\s]+$/.test(name);
   };

   const handleUpdate = (field) => {
      // Username validation
      if (field === "name" && !validateUsername(formData.name)) {
         setMessage({ text: "Name can only contain alphabets and spaces", type: "error" });
         setTimeout(() => setMessage({ text: "", type: "" }), 2000);
         return;
      }
   
      const validations = {
         mobile: value => /^\d{10}$/.test(value) || "Mobile number must be 10 digits.",
         pincode: value => /^\d{6}$/.test(value) || "Pincode must be 6 digits."
      };
   
      if (validations[field]) {
         const validationResult = validations[field](formData[field]);
         if (typeof validationResult === "string") {
            setMessage({ text: validationResult, type: "error" });
            setTimeout(() => setMessage({ text: "", type: "" }), 2000);
            return;
         }
      }
   
      // Create the update object with the correct field names
      let updateData = {};
      if (field === "mobile") {
         updateData = { mobNum: formData[field] };  // Change 'mobile' to 'mobNum'
      } else {
         updateData = { [field]: formData[field] };
      }
   
      dispatch(updateUserProfileAction(updateData));
      setMessage({ text: "Profile updated successfully.", type: "success" });
      setActiveEditField(null);
      setEditMode(prev => ({ ...prev, [field]: false }));
   
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
   };

   const handlePasswordChange = async (e) => {
      e.preventDefault();
      try {
         // Basic validation for empty fields
         if (!passwordData.currentPassword || !passwordData.newPassword) {
            throw new Error("All password fields are required");
         }

         // Validate new passwords match
         if (passwordData.newPassword !== passwordData.confirmPassword) {
            throw new Error("New passwords don't match!");
         }

         // Validate new password length
         if (passwordData.newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters long");
         }

         // First try to verify current password
         try {
            await dispatch(changePasswordAction({
               currentPassword: passwordData.currentPassword,
               newPassword: passwordData.newPassword
            }));

            // If we reach here, password change was successful
            setMessage({ text: "Password changed successfully!", type: "success" });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswordSection(false);
         } catch (error) {
            // If current password is wrong, show that specific error
            if (error.message?.toLowerCase().includes('current password')) {
               throw new Error("Current password is incorrect");
            }

            // If current password is correct but new password is same as current
            if (passwordData.currentPassword === passwordData.newPassword) {
               throw new Error("New password cannot be the same as current password");
            }

            throw error;
         }

         setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      } catch (error) {
         setMessage({
            text: error.message || "Failed to change password",
            type: "error"
         });

         setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      }
   };

   if (loading) return <SpinnerLoading />;

   return (
      <Layout>
         <section className="mb-12 py-16 bg-gradient-to-r from-cyan-700 via-blue-500 to-indigo-600">
            <div className="text-center text-gray-100 mb-12 px-6 py-10">
               <h2 className="text-4xl font-extrabold mt-8">Your Profile</h2>
               <p className="text-lg">Manage your personal information</p>
            </div>
         </section>

         <section className="container mx-auto px-4 md:px-12 max-w-7xl -mt-32">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
               {message.text && (
                  <Toast message={message.text} type={message.type} onClose={() => setMessage({ text: "", type: "" })} />
               )}

               <div className="grid md:grid-cols-2 gap-8">
                  <div>
                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Personal Information
                     </h3>

                     {["name", "mobile"].map(field => (
                        <ProfileField
                           key={field}
                           label={field === "mobile" ? "Mobile Number" : "Name"}
                           value={formData[field]}
                           isEditing={editMode[field]}
                           onEdit={() => handleEdit(field)}
                           onSave={() => handleUpdate(field)}
                           onCancel={() => handleCancel(field)}
                           onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                           disabled={!!activeEditField && activeEditField !== field}
                           passwordSectionOpen={showPasswordSection}
                        />
                     ))}

                     <div className="mb-6">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                           Email
                        </label>
                        <p className="text-gray-900 dark:text-white">{userInfo?.email}</p>
                     </div>

                     <PasswordSection
                        show={showPasswordSection}
                        onToggle={() => setShowPasswordSection(!showPasswordSection)}
                        passwordData={passwordData}
                        setPasswordData={setPasswordData}
                        onSubmit={handlePasswordChange}
                        disabled={!!activeEditField}
                     />
                  </div>

                  <div>
                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Address Information
                     </h3>

                     <ProfileField
                        label="Address"
                        value={formData.address}
                        isEditing={editMode.address}
                        onEdit={() => handleEdit("address")}
                        onSave={() => handleUpdate("address")}
                        onCancel={() => handleCancel("address")}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        inputType="textarea"
                        disabled={!!activeEditField && activeEditField !== "address"}
                        passwordSectionOpen={showPasswordSection}
                     />

                     <ProfileField
                        label="Pincode"
                        value={formData.pincode}
                        isEditing={editMode.pincode}
                        onEdit={() => handleEdit("pincode")}
                        onSave={() => handleUpdate("pincode")}
                        onCancel={() => handleCancel("pincode")}
                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                        disabled={!!activeEditField && activeEditField !== "pincode"}
                        passwordSectionOpen={showPasswordSection}
                     />
                  </div>
               </div>
            </div>
         </section>
      </Layout>
   );
}