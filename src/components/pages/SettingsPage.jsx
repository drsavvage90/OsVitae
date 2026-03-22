import { useState } from "react";
import { User, Save, RefreshCw, Download, Trash2 } from "lucide-react";
import { Glass } from "../ui";
import PrivacyPolicy from "../PrivacyPolicy";

export default function SettingsPage({
  profileData, setProfileData, saveProfile, profileSaving,
  themeName,
  appleConnected, showAppleConnect, setShowAppleConnect,
  appleIdInput, setAppleIdInput, appleAppPassword, setAppleAppPassword,
  appleConnecting, connectApple, syncError, setSyncError,
  appleCalendars, selectedCalendarId, setSelectedCalendarId,
  saveCalendarSelection, rediscoverCalendars,
  syncAll, syncStatus, lastSyncAt, disconnectApple,
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

        <div style={{ display:"flex",gap:12,marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Full Name</label>
            <input value={profileData.full_name} onChange={e => setProfileData(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" maxLength={200} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Date of Birth</label>
            <input type="date" value={profileData.date_of_birth} onChange={e => setProfileData(p => ({ ...p, date_of_birth: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        <div style={{ display:"flex",gap:12,marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Email</label>
            <input type="email" value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" maxLength={200} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Phone</label>
            <input type="tel" value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" maxLength={30} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Address Line 1</label>
          <input value={profileData.address_line1} onChange={e => setProfileData(p => ({ ...p, address_line1: e.target.value }))} placeholder="Street address" maxLength={200} style={inputStyle} />
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Address Line 2</label>
          <input value={profileData.address_line2} onChange={e => setProfileData(p => ({ ...p, address_line2: e.target.value }))} placeholder="Apt, suite, unit, etc. (optional)" maxLength={200} style={inputStyle} />
        </div>

        <div style={{ display:"flex",gap:12,marginBottom:12 }}>
          <div style={{ flex:2 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>City</label>
            <input value={profileData.city} onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))} placeholder="City" maxLength={100} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>State</label>
            <input value={profileData.state} onChange={e => setProfileData(p => ({ ...p, state: e.target.value }))} placeholder="State" maxLength={50} style={inputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>ZIP</label>
            <input value={profileData.zip} onChange={e => setProfileData(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP" maxLength={20} style={inputStyle} />
          </div>
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

      {/* Apple Calendar Connection */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"#000",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M13.21 9.48c-.02-1.89 1.55-2.8 1.62-2.84-.88-1.29-2.25-1.47-2.74-1.49-1.16-.12-2.28.69-2.87.69-.6 0-1.51-.67-2.49-.65-1.27.02-2.46.75-3.11 1.9-1.34 2.32-.34 5.74.95 7.62.64.92 1.4 1.95 2.39 1.91.97-.04 1.33-.62 2.49-.62 1.16 0 1.49.62 2.49.6 1.03-.02 1.69-.93 2.32-1.85.74-1.06 1.04-2.1 1.05-2.15-.02-.01-2.01-.77-2.1-3.12zM11.3 3.88c.52-.64.87-1.52.78-2.4-.75.03-1.68.51-2.22 1.14-.48.56-.91 1.47-.8 2.33.84.07 1.71-.43 2.24-1.07z" fill="white"/></svg>
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Apple Calendar</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>
              {appleConnected ? "Connected" : "Not connected"}
            </div>
          </div>
        </div>

        {!appleConnected && !showAppleConnect && (
          <button onClick={() => setShowAppleConnect(true)} style={{
            padding:"10px 20px",borderRadius:10,border:"none",
            background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
            fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
          }}>Connect Apple Calendar</button>
        )}

        {showAppleConnect && (
          <div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Apple ID</label>
              <input value={appleIdInput} onChange={e => setAppleIdInput(e.target.value)} placeholder="you@icloud.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>App-Specific Password</label>
              <input type="password" value={appleAppPassword} onChange={e => setAppleAppPassword(e.target.value)} placeholder="xxxx-xxxx-xxxx-xxxx" style={inputStyle} />
              <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)",marginTop:4 }}>
                Generate one at appleid.apple.com → Sign-In and Security → App-Specific Passwords
              </div>
            </div>
            {syncError && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"#EF4444",marginBottom:12 }}>Connection error. Please check your credentials and try again.</div>}
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={connectApple} disabled={appleConnecting} style={{
                padding:"10px 20px",borderRadius:10,border:"none",
                background:"#000",color:"#fff",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
                opacity: appleConnecting ? 0.6 : 1,
              }}>{appleConnecting ? "Connecting..." : "Connect"}</button>
              <button onClick={() => { setShowAppleConnect(false); setSyncError(null); }} style={{
                padding:"10px 20px",borderRadius:10,border:"1px solid var(--border)",
                background:"transparent",color:"var(--text)",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
              }}>Cancel</button>
            </div>
          </div>
        )}

        {appleConnected && (
          <div>
            {/* Calendar Selection */}
            {appleCalendars.length > 0 && (
              <div style={{ marginBottom:16 }}>
                {appleCalendars.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:6 }}>Sync Events From</label>
                    <select value={selectedCalendarId} onChange={e => setSelectedCalendarId(e.target.value)} style={{ ...inputStyle, cursor:"pointer" }}>
                      <option value="">Select a calendar...</option>
                      {appleCalendars.map(c => <option key={c.id} value={c.href}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={saveCalendarSelection} style={{
                  padding:"8px 16px",borderRadius:8,border:"none",
                  background:"var(--primary)",color:"var(--btn-text)",
                  fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",marginRight:8,
                }}>Save Selection</button>
                <button onClick={rediscoverCalendars} style={{
                  padding:"8px 16px",borderRadius:8,border:"1px solid var(--border)",
                  background:"transparent",color:"var(--text)",
                  fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",
                }}>Refresh List</button>
              </div>
            )}

            {appleCalendars.length === 0 && (
              <button onClick={rediscoverCalendars} style={{
                padding:"8px 16px",borderRadius:8,border:"1px solid var(--border)",
                background:"transparent",color:"var(--text)",
                fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:16,
              }}>Load Calendars</button>
            )}

            {/* Sync Controls */}
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingTop:12,borderTop:"1px solid var(--border-light)" }}>
              <button onClick={syncAll} disabled={syncStatus === "syncing"} style={{
                padding:"10px 20px",borderRadius:10,border:"none",
                background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",gap:8,
                opacity: syncStatus === "syncing" ? 0.6 : 1,
              }}>
                <RefreshCw size={14} style={{ animation: syncStatus === "syncing" ? "spin 1s linear infinite" : "none" }} />
                {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
              </button>
              {lastSyncAt && (
                <span style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--muted)" }}>
                  Last synced: {new Date(lastSyncAt).toLocaleString()}
                </span>
              )}
            </div>
            {syncError && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"#EF4444",marginBottom:12 }}>Connection error. Please check your credentials and try again.</div>}

            {/* Disconnect */}
            <button onClick={disconnectApple} style={{
              padding:"8px 16px",borderRadius:8,border:"1px solid #EF4444",
              background:"transparent",color:"#EF4444",
              fontFamily:"var(--body)",fontSize:12,fontWeight:600,cursor:"pointer",
            }}>Disconnect</button>
          </div>
        )}
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
