import { createContext, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";

const MetadataContext = createContext();

const MetadataProvider = ({ children }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMetadata = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/user/metadata");
      setMetadata(response.data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = async (updatedData) => {
    setLoading(true);
    try {
      const response = await api.put("/api/user/metadata", updatedData);

      if (response.data?.metadata) {
        setMetadata((prev) => ({ ...(prev ?? {}), ...response.data.metadata }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating metadata:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MetadataContext.Provider
      value={{
        metadata,
        loading,
        getMetadata,
        updateMetadata,
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
};

MetadataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { MetadataContext, MetadataProvider };
