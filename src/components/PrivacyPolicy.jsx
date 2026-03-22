export default function PrivacyPolicy() {
  const h = { fontWeight: 700, margin: '18px 0 8px', fontSize: 15, color: '#111' };
  const p = { fontSize: 13, color: '#374151', lineHeight: 1.6, margin: '0 0 10px' };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Privacy Policy</h2>
      <p style={p}>Last updated: March 22, 2026</p>

      <h3 style={h}>What We Collect</h3>
      <p style={p}>OSVitae stores only data you explicitly enter: tasks, habits, calendar events, journal entries, financial records, and optional profile information. Authentication is handled by Apple via OAuth &mdash; we never see or store your Apple password.</p>

      <h3 style={h}>How Your Data Is Stored</h3>
      <p style={p}>All data is stored in a Supabase-hosted PostgreSQL database with Row-Level Security (RLS) ensuring that only you can access your own data. Personal information (name, email, phone, address, date of birth) is encrypted at rest using AES-256-GCM before being stored in the database.</p>

      <h3 style={h}>Third-Party Services (Sub-Processors)</h3>
      <p style={p}><strong>Supabase</strong> &mdash; database hosting, authentication, and serverless functions (Supabase maintains a GDPR-compliant Data Processing Agreement). <strong>Apple</strong> &mdash; OAuth sign-in and optional CalDAV calendar sync (only if you choose to connect). <strong>Vercel</strong> &mdash; frontend hosting (Vercel maintains a GDPR-compliant Data Processing Addendum). <strong>Google Fonts</strong> &mdash; font delivery. No analytics, advertising, or tracking services are used.</p>

      <h3 style={h}>Local Storage</h3>
      <p style={p}>OSVitae uses browser localStorage strictly for functionality: your authentication session token and theme preference. No cookies are used for tracking.</p>

      <h3 style={h}>Data Export</h3>
      <p style={p}>You can export all of your data at any time as a JSON file from Settings &rarr; Your Data &rarr; Export.</p>

      <h3 style={h}>Account Deletion</h3>
      <p style={p}>You can permanently delete your account and all associated data from Settings &rarr; Danger Zone. This action is irreversible and removes all data from our servers, including authentication records, storage files, and all database rows.</p>

      <h3 style={h}>Data Sharing</h3>
      <p style={p}>Your data is never sold, shared with third parties, or used for advertising. Data is only transmitted between your browser and our Supabase backend over encrypted HTTPS connections.</p>

      <h3 style={h}>Security</h3>
      <p style={p}>All API requests require a valid JWT. CORS is restricted to our production domain. Edge Functions validate authentication server-side. Sessions automatically expire after 30 minutes of inactivity.</p>

      <h3 style={h}>Contact</h3>
      <p style={p}>For privacy questions or data requests, email <strong>privacy@osvitae.app</strong> or reach out via the project repository.</p>
    </div>
  );
}
