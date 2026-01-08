import { useContext, useEffect, useMemo, useState } from "react";
import { FiUser } from "react-icons/fi";

import SettingsRow from "../../../components/SettingsRow/SettingsRow.jsx";
import Button from "../../../components/common/Button/Button.jsx";
import { MetadataContext } from "../../../context/MetadataContext.jsx";

import layout from "./SettingsLayout.module.css";
import styles from "./MetadataTab.module.css";

const PRONOUN_OPTIONS = [
  { value: "he/him", label: "He / Him" },
  { value: "she/her", label: "She / Her" },
  { value: "they/them", label: "They / Them" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const MetadataTab = () => {
  const { metadata, loading, getMetadata, updateMetadata } = useContext(MetadataContext);

  const [nickName, setNickName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!metadata) {
      getMetadata();
    }
  }, [metadata, getMetadata]);

  useEffect(() => {
    if (!metadata) return;
    setNickName(metadata.nickName ?? "");
    setPronouns(metadata.pronouns ?? "");
  }, [metadata]);

  const isDirty = useMemo(() => {
    if (!metadata) return false;
    return (metadata.nickName ?? "") !== nickName || (metadata.pronouns ?? "") !== pronouns;
  }, [metadata, nickName, pronouns]);

  const handleSave = async () => {
    setStatus({ type: "", message: "" });
    setSaving(true);

    const ok = await updateMetadata({
      nickName: nickName.trim(),
      pronouns,
    });

    if (ok) {
      setStatus({ type: "success", message: "Saved" });
    } else {
      setStatus({ type: "error", message: "Save failed" });
    }

    setSaving(false);
  };

  return (
    <div className={layout.pageContainer}>
      <div className={layout.header}>
        <div className={layout.pageTitle}>Personalization</div>
        <div className={layout.pageDescription}>Update how we address you.</div>
      </div>

      <SettingsRow
        icon={<FiUser size={18} />}
        title="Nickname"
        description="Used to personalize the chat"
        action={
          <input
            className={styles.input}
            type="text"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            disabled={loading || saving}
          />
        }
      />

      <SettingsRow
        icon={<FiUser size={18} />}
        title="Pronouns"
        description="How should we address you?"
        action={
          <select
            className={styles.select}
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            disabled={loading || saving}
          >
            <option value="">Select</option>
            {PRONOUN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        }
      />

      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading || saving || !isDirty || !nickName.trim() || !pronouns}
        >
          {saving ? "Saving..." : "Save"}
        </Button>

        {status.message && (
          <div className={status.type === "success" ? styles.success : styles.error}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataTab;
