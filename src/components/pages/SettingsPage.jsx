import { useState } from "react";
import { User, Save, Download, Trash2 } from "lucide-react";
import { Glass } from "../ui";
import PrivacyPolicy from "../PrivacyPolicy";

export default function SettingsPage({
  profileData, setProfileData, saveProfile, profileSaving,
  themeName,
  exportData, exporting, deleteAccount, deleting,
  inputStyle,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontFamily:"var(--heading)",fontSize:22,fontWeight:800,color:"var(--text)",marginBottom:24 }}>Settings</h2>

      {/* Profile */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <User size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Profile</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Your personal information</div>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Preferred Name</label>
          <input value={profileData.preferred_name} onChange={e => setProfileData(p => ({ ...p, preferred_name: e.target.value }))} placeholder="Your preferred name" maxLength={200} style={inputStyle} />
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Country</label>
          <input value={profileData.country} onChange={e => setProfileData(p => ({ ...p, country: e.target.value }))} placeholder="Country" maxLength={100} style={inputStyle} />
        </div>

        <button onClick={saveProfile} disabled={profileSaving} style={{
          padding:"10px 20px",borderRadius:10,border:"none",
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
          fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
          display:"flex",alignItems:"center",gap:8,
          opacity: profileSaving ? 0.6 : 1,
        }}>
          <Save size={14} />
          {profileSaving ? "Saving..." : "Save Profile"}
        </button>
      </Glass>

      {/* Your Data */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Download size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Your Data</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Download a copy of all your data</div>
          </div>
        </div>
        <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",marginBottom:16 }}>
          Export all your tasks, habits, finances, notes, and profile information as a JSON file. Your profile data is encrypted at rest and will be decrypted for the export.
        </div>
        <button onClick={exportData} disabled={exporting} style={{
          padding:"10px 20px",borderRadius:10,border:"none",
          background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
          fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
          display:"flex",alignItems:"center",gap:8,
          opacity: exporting ? 0.6 : 1,
        }}>
          <Download size={14} />
          {exporting ? "Exporting..." : "Export All Data"}
        </button>
      </Glass>

      {/* Danger Zone */}
      <Glass style={{ padding:24,marginBottom:20,border:"1px solid rgba(239,68,68,0.2)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Trash2 size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"#EF4444" }}>Danger Zone</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Permanently delete your account and all data</div>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} style={{
            padding:"10px 20px",borderRadius:10,border:"1px solid #EF4444",
            background:"transparent",color:"#EF4444",
            fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
          }}>Delete Account</button>
        ) : (
          <div>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",marginBottom:12 }}>
              This action is <strong>permanent</strong> and cannot be undone. All your data — tasks, habits, finances, notes, and profile — will be permanently deleted.
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Type DELETE to confirm</label>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                maxLength={10}
                style={inputStyle}
              />
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                style={{
                  padding:"10px 20px",borderRadius:10,border:"none",
                  background: deleteConfirmText === "DELETE" ? "#EF4444" : "#ccc",
                  color:"#fff",
                  fontFamily:"var(--body)",fontSize:13,fontWeight:600,
                  cursor: deleteConfirmText === "DELETE" && !deleting ? "pointer" : "not-allowed",
                  opacity: deleting ? 0.6 : 1,
                }}
              >{deleting ? "Deleting..." : "Permanently Delete Account"}</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }} style={{
                padding:"10px 20px",borderRadius:10,border:"1px solid var(--border)",
                background:"transparent",color:"var(--text)",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
              }}>Cancel</button>
            </div>
          </div>
        )}
      </Glass>

      {/* Privacy Policy */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <details>
          <summary style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)",cursor:"pointer" }}>Privacy Policy</summary>
          <div style={{ marginTop:16 }}>
            <PrivacyPolicy />
          </div>
        </details>
      </Glass>
    </div>
  );
}
