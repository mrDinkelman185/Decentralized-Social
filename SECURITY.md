# Security Policy & Fix Documentation

**Last updated:** 2025-01-29  
**Status:** Backdoors neutralized; critical and high vulnerabilities addressed.

---

## Executive Summary

This document consolidates all security fixes applied to the Decentralized-Social project: backdoors that were found and neutralized, code and dependency fixes, and required follow-up actions.

### What Was Done

- **Backdoors neutralized:** Remote code execution in `server/utils/sendGmail.js` and malicious VS Code task in `.vscode/tasks.json` (removed).
- **Critical/High dependency vulnerabilities:** Addressed via package overrides, upgrades, and removal of vulnerable packages (e.g. `@alch/alchemy-web3` replaced with `ethers`).
- **Application security:** CSRF protection (csrf-sync), rate limiting, Helmet headers, open-redirect fixes, weak hash (MD4) replaced with SHA256, secrets moved to environment variables.

---

## 1. Backdoors Found and Neutralized

### 1.1 Backdoor #1 – sendGmail.js (RCE)

- **Location:** `server/utils/sendGmail.js`
- **Behavior:** On application start, code decoded a base64 URL from `server/data/products.json`, sent a POST request to `https://www.whatisip.app/api/ip-check-encrypted/3aeb34a38`, and **executed the response as JavaScript** via `Function.constructor`.
- **Fix:** Malicious logic removed and replaced with a safe implementation. The file now only performs intended email/send functionality.

### 1.2 Backdoor #2 – .vscode/tasks.json

- **Location:** `.vscode/tasks.json`
- **Behavior:** Task triggered on folder open, contacting `https://www.regioncheck.xyz/settings/[os]?flag=8`.
- **Fix:** File removed. Do not restore it.

### 1.3 Other Findings from Scans

- **Hardcoded JWT (Moralis API)** in `WalletBalances.tsx` and `Setup5.tsx`: Removed.
- **Hardcoded secrets:** Moved to environment variables (see below).

---

## 2. Required Actions (You Must Do)

### 2.1 Rotate All API Keys and Secrets

If the application or backdoors ever ran with real credentials, assume keys are compromised.

- Rotate every key in `.env`: e.g. `ALCHEMY_API_KEY`, `INFURA_API_KEY`, `PINITA_API_KEY` / `PINITA_API_SECRET`, `MORALIS_API_KEY`, `SENDGRID_API_KEY`, and any other API keys.
- Generate a new **session secret** and set `SESSION_SECRET` in `.env`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 2.2 Change Passwords

- Change passwords for any accounts that were stored or used in `.env` or in the app.
- Rotate SSH keys and any other credentials tied to this project.

### 2.3 Harden Production

- Set `NODE_ENV=production`.
- In `.env`, set `CORS_ORIGIN` (and any `APP_URL`) to your real domain(s); avoid `*` in production.
- Keep `.env` out of git; use `.env.example` as a template only (no real secrets).

### 2.4 Optional: Verify System and Snyk

- Run `npm audit` and, if needed, `npm audit fix` (use `--force` only if you accept breaking changes).
- If you use Snyk: `npx snyk auth` then `npx snyk test` and `npx snyk code test`.
- Manually check logs and network history if you need to confirm whether backdoor code ever executed.

---

## 3. Code Fixes Applied

### 3.1 CSRF Protection

- **Where:** `server/app.js`
- **What:** Replaced disabled/deprecated CSRF with **csrf-sync** (synchronizer token pattern). Token is read from request body `_csrf` or header `x-csrf-token`. Frontend sends token from meta tag `csrf-token`.

### 3.2 Rate Limiting

- **Where:** `server/app.js`, `server/routes/login.js`, `server/routes/register.js`
- **What:**
  - Global: 100 requests per 15 minutes per IP.
  - Login/Register GET: 30 requests per 15 minutes per IP.
  - Login/Register POST: 5 attempts per 15 minutes per IP, `skipSuccessfulRequests: true` to reduce brute-force impact.

### 3.3 Security Headers

- **Where:** `server/app.js`
- **What:** Helmet middleware added. X-Powered-By disabled. CSP can be enabled in production as needed.

### 3.4 Open Redirect

- **Where:** `src/components/layout/Header/WalletBalances.tsx`, `src/components/layout/MintUsername/Setup5.tsx`
- **What:** All `window.open()` calls use a shared helper that validates URL (protocol and allowed domains) and uses `noopener,noreferrer`. Only whitelisted domains (e.g. opensea.io, etherscan.io, nft.cawmnty.com) are allowed.

### 3.5 Weak Hash (MD4) in createHash.js

- **Where:** `server/utils/createHash.js`
- **What:** MD4/native-md4 usage replaced with **SHA-256** for the relevant code paths. `require("crypto")` updated to `require("node:crypto")` where applicable.

### 3.6 Hardcoded Secrets and Config

- **Where:** `server/config/default.js`, `server/app.js`
- **What:**
  - Session secret: from `process.env.SESSION_SECRET` (with secure fallback if needed for dev).
  - Port, MongoDB URL, RTMP/HTTP ports, CORS origin, FFmpeg path: from environment variables.
  - `.env.example` added with all required variables and warnings (no real secrets).

### 3.7 Other Code Fixes

- **server/app.js:** `Date().now` corrected to `Date.now()`.
- **Login/Register EJS:** Page titles and form labels fixed for accessibility and tooling (SonarLint).
- **index.ejs / header.ejs:** Viewport meta no longer disables zoom (`user-scalable=no` removed).

---

## 4. Dependency and Package Fixes

### 4.1 Removed Packages

- **@alch/alchemy-web3** – Replaced with **ethers** (see below).
- **request** – Deprecated, SSRF risk; removed with alchemy-web3.
- **express-fileupload** – Arbitrary file upload issues; removed (multer used instead).
- **sequelize** – Not used (project uses mongoose); removed.
- **@walletconnect/web3-provider** – Deprecated v1; removed.
- **csurf** – Deprecated; replaced by csrf-sync.
- **moralis-v1** – Deprecated; removed.
- **sqlite3** – Not used; removed.
- **@metamask/jazzicon** – ReDoS (color-string); replaced with **ethereum-blockies**.

### 4.2 Replaced Packages

- **@alch/alchemy-web3** → **ethers** (WalletBalances.tsx, Setup3.tsx, Setup4.tsx): `createAlchemyWeb3` + `web3.eth.Contract` replaced with `ethers.JsonRpcProvider` and `ethers.Contract`; async calls updated (e.g. `contract.methodName()`).
- **@metamask/jazzicon** → **ethereum-blockies** in `src/services/web3/components/Identicon.tsx`.

### 4.3 Upgraded Packages

- **multer** 1.4.5-lts.1 → 2.0.2  
- **web3-utils** 1.4.0 → 4.2.1 (and overrides)  
- **qs** 6.10.2 → 6.14.1  
- **@alch/alchemy-web3** 0.1.8 → 1.4.7 (then package removed entirely)  
- **swagger-jsdoc** 6.2.8 → 7.0.0-rc.6 (to drop inflight dependency)

### 4.4 package.json Overrides

Used to force patched versions of transitive dependencies:

```json
"overrides": {
  "form-data": "^4.0.4",
  "web3-utils": "^4.2.1",
  "ws": "^8.17.1",
  "tar": "^7.5.7",
  "tough-cookie": "^4.1.3",
  "glob": "^10.0.0",
  "request": {
    "qs": "^6.14.1"
  }
}
```

### 4.5 Additions

- **csrf-sync** – CSRF protection (synchronizer token).
- **ethereum-blockies** – Identicon replacement for @metamask/jazzicon.
- **ethers** – Used instead of @alch/alchemy-web3 for contract and RPC usage.

---

## 5. Vulnerabilities Addressed (Summary)

- **form-data** (CVE-2025-7783) – Override to 4.x.
- **qs** (CVE-2025-15284) – Upgrade and override.
- **web3-utils** (CVE-2024-21505) – Upgrade and override.
- **color-string** (ReDoS) – Removed by replacing @metamask/jazzicon with ethereum-blockies.
- **elliptic** (multiple) – Reduced by upgrading/removing alchemy-web3; some may remain in other deps.
- **url-parse** (CVE-2022-0691) – Addressed via alchemy-web3 upgrade then removal.
- **ws** (CVE-2024-37890) – Override to 8.17.1.
- **tar** (multiple CVEs) – Override to 7.5.7.
- **tough-cookie** (CVE-2023-26136) – Override to 4.1.3.
- **request** (CVE-2023-28155), **web3-core-method**, **web3-core-subscriptions**, **web3** – Removed with @alch/alchemy-web3.
- **inflight** – Addressed by upgrading swagger-jsdoc so glob no longer pulls in inflight.

---

## 6. Remaining / Known Limitations

- **elliptic** (e.g. CVE-2025-14505) may still appear in other dependencies (e.g. moralis, alchemy-sdk); full removal may require further migration to ethers or other stacks.
- **inflight** – If swagger-jsdoc is downgraded, it may reappear; current fix uses swagger-jsdoc 7.0.0-rc.6.
- **Pinata API keys** in frontend (Setup4.tsx): Prefer moving Pinata calls to the backend and serving keys only from server environment variables.
- Run `npm audit` and `npx snyk test` periodically; some issues may require major upgrades or architectural changes.

---

## 7. Legal and Reporting

The code in `server/utils/sendGmail.js` and `.vscode/tasks.json` constituted a **backdoor** (remote code execution and unauthorized external communication). This is a serious computer misuse issue in many jurisdictions. You may report it to your local law enforcement or cybercrime unit and retain this document and related evidence (e.g. git history, logs) for that purpose.

---

## 8. Quick Reference

| Item | Location / Command |
|------|--------------------|
| Session secret | `process.env.SESSION_SECRET`; generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| Env template | `.env.example` |
| CSRF | csrf-sync in `server/app.js`; token in meta `csrf-token`, header `x-csrf-token` or body `_csrf` |
| Rate limits | `server/app.js` (global + auth routes in login.js, register.js) |
| Dependency scan | `npm audit`; `npx snyk test` (after `npx snyk auth`) |
| Code scan | `npx snyk code test` |

All historical “how we fixed this” details from the previous security reports, cleanup summaries, and scan results have been merged into this single SECURITY.md.
