import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// ── CONFIGURE VIA ENV or CLI ──────────────────
const TEAM_ID = process.env.APPLE_TEAM_ID || process.argv[2]
const CLIENT_ID = process.env.APPLE_CLIENT_ID || process.argv[3]
const KEY_ID = process.argv[4] || process.env.APPLE_KEY_ID

if (!TEAM_ID || !CLIENT_ID || !KEY_ID) {
  console.error('Usage: node scripts/generate-apple-secret.js <TEAM_ID> <CLIENT_ID> <KEY_ID> <path-to-.p8-file>')
  console.error('  Or set APPLE_TEAM_ID, APPLE_CLIENT_ID, APPLE_KEY_ID env vars and: node scripts/generate-apple-secret.js <path-to-.p8-file>')
  process.exit(1)
}

const p8Path = process.argv[5] || process.argv[2] // last arg or first if using env vars
if (!p8Path) {
  console.error('Please provide the path to the .p8 file as the last argument')
  process.exit(1)
}

const privateKey = fs.readFileSync(path.resolve(p8Path), 'utf8')

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // 6 months (Apple maximum)
  audience: 'https://appleid.apple.com',
  issuer: TEAM_ID,
  subject: CLIENT_ID,
  keyid: KEY_ID,
})

console.log('\n=== Your Apple Client Secret (JWT) ===\n')
console.log(token)
console.log('\nPaste this into Supabase > Apple provider > Secret Key field.\n')
console.log('This token expires in 180 days. Regenerate before it expires.\n')
