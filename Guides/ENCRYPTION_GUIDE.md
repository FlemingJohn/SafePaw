# 🔐 Encryption Security Guide for SafePaw

## Overview

SafePaw uses **AES-256 encryption** to protect sensitive government data (Government ID numbers) before storing in Firestore. This is a **FREE** security enhancement that ensures even if someone gains access to your database, they cannot read the encrypted data without the encryption key.

---

## What Gets Encrypted?

### ✅ Encrypted Fields:
- **Government ID Card Number** (`govtId`)
  - Encrypted before storing in Firestore
  - Only decrypted when needed by authorized users
  - Marked with `govtIdEncrypted: true` flag

### ❌ NOT Encrypted (No Need):
- **Passwords** - Already encrypted by Firebase Auth
- **Email** - Needed for queries and login
- **Name, City, State** - Public information
- **Ward Number** - Public administrative data

---

## How It Works

### 1. **Encryption Process:**

```typescript
User enters: "GOV123456"
    ↓
Encrypted: "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
    ↓
Stored in Firestore (encrypted)
```

### 2. **Decryption Process:**

```typescript
Retrieve from Firestore: "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
    ↓
Decrypt with key
    ↓
Display: "GOV123456"
```

---

## Setup Instructions

### Step 1: Install Crypto Library

```bash
cd frontend
npm install crypto-js
```

### Step 2: Set Encryption Key

Create `.env.local` file:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Generate a strong key (use one of these methods):

# Method 1: OpenSSL (Recommended)
# Run: openssl rand -base64 32
VITE_ENCRYPTION_KEY=your-generated-key-here

# Method 2: Online Generator
# Visit: https://randomkeygen.com/
# Use "CodeIgniter Encryption Keys"
VITE_ENCRYPTION_KEY=your-generated-key-here

# Method 3: Simple (Development Only)
VITE_ENCRYPTION_KEY=safepaw-dev-key-2024-change-in-production
```

### Step 3: Verify Setup

The encryption is already integrated! Just ensure:
- ✅ `crypto-js` is installed
- ✅ `.env.local` has `VITE_ENCRYPTION_KEY`
- ✅ `.env.local` is in `.gitignore` (never commit it!)

---

## Security Best Practices

### 🔐 Encryption Key Management

#### Development:
```env
# .env.local (local development)
VITE_ENCRYPTION_KEY=dev-key-not-for-production
```

#### Production:
```env
# Use Firebase Hosting environment variables
# OR Google Cloud Secret Manager
VITE_ENCRYPTION_KEY=<strong-random-32-char-key>
```

### ⚠️ NEVER:
- ❌ Commit `.env.local` to Git
- ❌ Share encryption key publicly
- ❌ Use same key for dev and production
- ❌ Hardcode the key in source code

### ✅ ALWAYS:
- ✅ Use environment variables
- ✅ Generate strong random keys
- ✅ Rotate keys periodically
- ✅ Keep backups of production keys securely

---

## How to Generate Strong Keys

### Method 1: OpenSSL (Best)
```bash
openssl rand -base64 32
# Output: xK7jP9mN2qR5tY8wE3vB6nM4lH1sD0fG9cA7uI5oT2k=
```

### Method 2: Node.js
```javascript
require('crypto').randomBytes(32).toString('base64')
```

### Method 3: Python
```python
import secrets
secrets.token_urlsafe(32)
```

---

## Testing Encryption

### Test in Browser Console:

```javascript
// Import encryption functions
import { encryptData, decryptData } from './utils/encryption';

// Test encryption
const original = "GOV123456";
const encrypted = encryptData(original);
console.log("Encrypted:", encrypted);

// Test decryption
const decrypted = decryptData(encrypted);
console.log("Decrypted:", decrypted);

// Should match
console.log("Match:", original === decrypted); // true
```

---

## Firestore Data Structure

### Before Encryption:
```json
{
  "uid": "abc123",
  "govtId": "GOV123456",  // ⚠️ Plain text - INSECURE
  "name": "Officer Name"
}
```

### After Encryption:
```json
{
  "uid": "abc123",
  "govtId": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=",  // ✅ Encrypted
  "govtIdEncrypted": true,  // ✅ Flag for decryption
  "name": "Officer Name"
}
```

---

## Cost Analysis

### Firebase Costs: **$0.00**
- ✅ Encryption happens on client-side
- ✅ No additional Firebase operations
- ✅ Same read/write costs as before
- ✅ No extra storage costs

### Library Costs: **$0.00**
- ✅ crypto-js is FREE and open-source
- ✅ No licensing fees
- ✅ No API calls

### Total Cost: **$0.00** 🎉

---

## Limitations

### What Encryption DOES:
- ✅ Protects data at rest in Firestore
- ✅ Prevents unauthorized database access
- ✅ Adds extra security layer

### What Encryption DOESN'T:
- ❌ Protect data in transit (HTTPS does this)
- ❌ Prevent authorized users from decrypting
- ❌ Allow querying encrypted fields

---

## Troubleshooting

### Error: "Decryption failed"
**Cause:** Wrong encryption key or corrupted data

**Solution:**
1. Check `.env.local` has correct key
2. Ensure key hasn't changed
3. Verify data wasn't manually edited

### Error: "Cannot find module 'crypto-js'"
**Cause:** Library not installed

**Solution:**
```bash
npm install crypto-js
```

### Encrypted data looks wrong
**Cause:** Normal! Encrypted data is random-looking

**Example:**
```
Original: GOV123456
Encrypted: U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=
```

---

## Migration Guide

### If You Already Have Users:

**Option 1: Gradual Migration (Recommended)**
```typescript
// Check if data is encrypted
if (userProfile.govtIdEncrypted) {
  // Decrypt
  govtId = decryptData(userProfile.govtId);
} else {
  // Use as-is (old data)
  govtId = userProfile.govtId;
  
  // Optionally: Encrypt and update
  await updateDoc(doc(db, 'users', uid), {
    govtId: encryptData(govtId),
    govtIdEncrypted: true
  });
}
```

**Option 2: Bulk Migration**
Run a script to encrypt all existing Government IDs.

---

## Advanced: Key Rotation

### When to Rotate:
- Every 6-12 months
- After security breach
- When team member leaves

### How to Rotate:
1. Generate new key
2. Decrypt all data with old key
3. Re-encrypt with new key
4. Update environment variable
5. Deploy

---

## Compliance

### GDPR Compliance:
- ✅ Encryption at rest
- ✅ Data minimization
- ✅ Right to erasure (can delete)

### India Data Protection:
- ✅ Sensitive personal data encrypted
- ✅ Government ID protected
- ✅ Access controls in place

---

## Summary

✅ **What You Get:**
- Government IDs encrypted in database
- FREE implementation
- No performance impact
- Easy to use

✅ **What You Need:**
- `crypto-js` library (FREE)
- Encryption key in `.env.local`
- 5 minutes setup time

✅ **Security Level:**
- **Before:** Basic Firestore security rules
- **After:** AES-256 encryption + Firestore rules

**Your sensitive data is now protected!** 🔐
