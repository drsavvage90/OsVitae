import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// ── CONFIGURE THESE ──────────────────────────
const TEAM_ID = '449BY8M6PP'
const CLIENT_ID = 'com.osvitae.web'
const KEY_ID = process.argv[2] // pass as first argument

if (!KEY_ID) {
  console.error('Usage: node scripts/generate-apple-secret.js <KEY_ID> <path-to-.p8-file>')
  process.exit(1)
}

const p8Path = process.argv[3] // pass as second argument
if (!p8Path) {
  console.error('Usage: node scripts/generate-apple-secret.js <KEY_ID> <path-to-.p8-file>')
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
