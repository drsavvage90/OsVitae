import { useState } from "react";
import { User, Save, Download, Trash2, KeyRound, Mail, Home, UserPlus, Check, X } from "lucide-react";
import { Glass } from "../ui";
import { supabase } from "../../lib/supabase";

export default function SettingsPage({
  profileData, setProfileData, saveProfile, profileSaving,
  themeName,
  exportData, exporting, deleteAccount, deleting,
  inputStyle,
  household, householdMembers, pendingInvites, incomingInvite,
  householdLoading, createHousehold, inviteMember, acceptInvite, declineInvite,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [settingsTab, setSettingsTab] = useState("general");
  const tabStyle = (t) => ({ padding:"8px 20px",borderRadius:10,cursor:"pointer",fontFamily:"var(--body)",fontSize:13,fontWeight:600,background:settingsTab===t?"var(--text)":"transparent",color:settingsTab===t?"var(--text-on-primary)":"var(--muted)",transition:"all 0.2s" });
  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontFamily:"var(--heading)",fontSize:22,fontWeight:800,color:"var(--text)",marginBottom:16 }}>Settings</h2>

      <div style={{ display:"flex",gap:4,marginBottom:20,background:"var(--subtle-bg)",borderRadius:12,padding:4,width:"fit-content" }}>
        <div onClick={() => setSettingsTab("general")} style={tabStyle("general")}>General</div>
        <div onClick={() => setSettingsTab("household")} style={tabStyle("household")}>Household</div>
      </div>

      {settingsTab === "general" && <>
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

      {/* Change Email */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Mail size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Change Email</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Update your login email address</div>
          </div>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault(); setEmailErr(""); setEmailMsg(""); setEmailLoading(true);
          const { error } = await supabase.auth.updateUser({ email: newEmail }, { emailRedirectTo: window.location.origin });
          if (error) { setEmailErr(error.message); } else { setEmailMsg("Confirmation sent to your new email. Check your inbox."); setNewEmail(""); }
          setEmailLoading(false);
        }} style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <input type="email" placeholder="New email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={inputStyle} />
          {emailErr && <p style={{ color:"#EF4444",fontSize:13,margin:0 }}>{emailErr}</p>}
          {emailMsg && <p style={{ color:"#10B981",fontSize:13,margin:0 }}>{emailMsg}</p>}
          <button type="submit" disabled={emailLoading} style={{
            padding:"10px 20px",borderRadius:10,border:"none",
            background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
            fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
            display:"flex",alignItems:"center",gap:8,
            opacity: emailLoading ? 0.6 : 1,
          }}>
            <Mail size={14} />
            {emailLoading ? "Updating..." : "Update Email"}
          </button>
        </form>
      </Glass>

      {/* Change Password */}
      <Glass style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <KeyRound size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Change Password</div>
            <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Update your login password</div>
          </div>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault(); setPwErr(""); setPwMsg(""); setPwLoading(true);
          if (newPw.length < 6) { setPwErr("Password must be at least 6 characters"); setPwLoading(false); return; }
          if (newPw !== confirmPw) { setPwErr("Passwords do not match"); setPwLoading(false); return; }
          const { error } = await supabase.auth.updateUser({ password: newPw });
          if (error) { setPwErr(error.message); } else { setPwMsg("Password updated successfully."); setNewPw(""); setConfirmPw(""); }
          setPwLoading(false);
        }} style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <input type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required style={inputStyle} />
          {pwErr && <p style={{ color:"#EF4444",fontSize:13,margin:0 }}>{pwErr}</p>}
          {pwMsg && <p style={{ color:"#10B981",fontSize:13,margin:0 }}>{pwMsg}</p>}
          <button type="submit" disabled={pwLoading} style={{
            padding:"10px 20px",borderRadius:10,border:"none",
            background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
            fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
            display:"flex",alignItems:"center",gap:8,
            opacity: pwLoading ? 0.6 : 1,
          }}>
            <KeyRound size={14} />
            {pwLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
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
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)",textDecoration:"none",display:"flex",alignItems:"center",gap:8 }}>
          Privacy Policy <span style={{ fontSize:12,color:"var(--muted)" }}>&rarr;</span>
        </a>
      </Glass>
      </>}

      {settingsTab === "household" && <>
        {householdLoading ? (
          <Glass style={{ padding:24 }}>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>Loading...</div>
          </Glass>
        ) : incomingInvite ? (
          <Glass style={{ padding:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
              <div style={{ width:40,height:40,borderRadius:12,background:"#22C55E",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Mail size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>You're Invited!</div>
                <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Join <strong>{incomingInvite.households?.name || "a household"}</strong></div>
              </div>
            </div>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",marginBottom:16 }}>
              Someone has invited you to share finances together. Accept to see their bills, budgets, and transactions.
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={acceptInvite} style={{
                padding:"10px 20px",borderRadius:10,border:"none",
                background:"#22C55E",color:"#fff",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",gap:6,
              }}><Check size={14} /> Accept</button>
              <button onClick={declineInvite} style={{
                padding:"10px 20px",borderRadius:10,border:"1px solid var(--border)",
                background:"transparent",color:"var(--text)",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
              }}>Decline</button>
            </div>
          </Glass>
        ) : !household ? (
          <Glass style={{ padding:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
              <div style={{ width:40,height:40,borderRadius:12,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Home size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)" }}>Create a Household</div>
                <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Share finances with your partner or family</div>
              </div>
            </div>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:16 }}>
              Create a household to share your bills, budgets, and transactions. Both members can view and edit everything.
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <input value={householdName} onChange={e => setHouseholdName(e.target.value)} placeholder="e.g. Nordgren Family" style={inputStyle}
                onKeyDown={e => { if (e.key === "Enter" && householdName.trim()) { createHousehold(householdName.trim()); setHouseholdName(""); }}} />
              <button onClick={() => { if (householdName.trim()) { createHousehold(householdName.trim()); setHouseholdName(""); }}} style={{
                padding:"10px 20px",borderRadius:10,border:"none",
                background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
                fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",
              }}>Create Household</button>
            </div>
          </Glass>
        ) : (
          <>
            {/* Household Info */}
            <Glass style={{ padding:24,marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
                <div style={{ width:40,height:40,borderRadius:12,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Home size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:800,color:"var(--text)" }}>{household.name}</div>
                  <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)" }}>Your shared household</div>
                </div>
              </div>
            </Glass>

            {/* Members */}
            <Glass style={{ padding:24,marginBottom:20 }}>
              <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:16 }}>Members</div>
              {householdMembers.map(m => (
                <div key={m.userId} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border-light)" }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <User size={16} color="var(--muted)" />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"var(--body)",fontSize:13,fontWeight:600,color:"var(--text)" }}>{m.name}{m.isMe ? " (you)" : ""}</div>
                  </div>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",background:"var(--subtle-bg)",padding:"3px 10px",borderRadius:6,fontWeight:600 }}>{m.role}</span>
                </div>
              ))}
            </Glass>

            {/* Invite */}
            <Glass style={{ padding:24,marginBottom:20 }}>
              <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:8 }}>Invite Member</div>
              <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",marginBottom:14 }}>They'll see the invite when they log in to Settings &gt; Household.</div>
              <div style={{ display:"flex",gap:8 }}>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" type="email" style={inputStyle}
                  onKeyDown={e => { if (e.key === "Enter" && inviteEmail.trim()) { inviteMember(inviteEmail.trim()); setInviteEmail(""); }}} />
                <button onClick={() => { if (inviteEmail.trim()) { inviteMember(inviteEmail.trim()); setInviteEmail(""); }}} style={{
                  padding:"10px 20px",borderRadius:10,border:"none",
                  background:themeName === "halo" ? "linear-gradient(135deg, #4ADE80, #FFB000)" : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",color:"var(--btn-text)",
                  fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",
                }}><UserPlus size={14} /> Invite</button>
              </div>

              {pendingInvites.length > 0 && (
                <div style={{ marginTop:16 }}>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontWeight:600 }}>Pending</div>
                  {pendingInvites.map(inv => (
                    <div key={inv.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0" }}>
                      <Mail size={14} color="var(--muted)" />
                      <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>{inv.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </Glass>
          </>
        )}
      </>}
    </div>
  );
}
