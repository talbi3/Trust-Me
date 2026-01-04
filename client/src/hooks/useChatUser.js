import { useContext } from "react";
// Ensure the path to useProfile is correct. If it's in the same folder, use "./useProfile.js"
import { useProfilePage } from "./useProfile.js";  
import { UserContext } from "../context/UserContext.jsx";  

export const useChatUser = () => {

  const { safeProfile } = useProfilePage();

  // Safety check: Ensure context exists
  const userContextData = useContext(UserContext) || {};
  const user = userContextData.user;

  const getActiveUserId = () => {
    // 1. Try from Profile Hook
    if (safeProfile?.id) return safeProfile.id;
    
    // 2. Try from Context
    if (user?.id) return user.id;
    if (user?._id) return user._id;
    
    // 3. Try from LocalStorage (Persisted Auth)
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.id || parsed._id;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    return null; 
  };

  return getActiveUserId();
};