
import { useState, useContext, useEffect } from "react";
import { ProfileContext } from "../context/ProfileContext";
import { UserContext } from "../context/UserContext";
const API_BASE = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:5000';

export const useProfilePage = () => {
  const { profile, loading, getProfile, updateProfile } = useContext(ProfileContext);
  
  const { user } = useContext(UserContext);

  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    profilePictureUrl: "",
  });

  useEffect(() => {
    if (user?.email && !profile) {
      getProfile(user.email);
    }
  }, [user, profile, getProfile]);

  const safeProfile = profile || {};

  const handleEdit = () => {
    setStatus({ type: "", message: "" });
    setForm({
      name: safeProfile.name || "",
      email: safeProfile.email || "",
      dateOfBirth: safeProfile.dateOfBirth || "",
      profilePictureUrl: safeProfile.profilePictureUrl || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setStatus({ type: "", message: "" });
    setIsEditing(false);
  };

  const handleFileChange = async (file) => {
    if (!file) return;

    setStatus({ type: "", message: "" });
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("image", file); 

      const uploadUrl = `${API_BASE.replace(/\/$/, "")}/api/upload/profile-picture`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      }); 

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setForm((prev) => ({ ...prev, profilePictureUrl: data.url }));
      setStatus({ type: "success", message: "Image uploaded! Don't forget to Save." });
      
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Image upload failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      email: user.email,  
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      profilePictureUrl: form.profilePictureUrl, 
    };

    const success = await updateProfile(payload);

    if (success) {
      setStatus({ type: "success", message: "Saved successfully ✅" });
      setIsEditing(false);
    } else {
      setStatus({ type: "error", message: "Save failed. Please try again." });
    }
    setSaving(false);
  };

  return {
    loading,
    saving,
    isEditing,
    status,
    form,
    safeProfile,  
    isDisabled: loading || saving,
    setForm,
    handleEdit,
    handleCancel,
    handleFileChange,
    handleSave,
  };
};