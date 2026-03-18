# ATF Vaktha Portal – Contribution Guidelines

Welcome to the ATF Vaktha Leadership & Speech Development Platform.

This project follows a structured development workflow to ensure stability, governance, and production safety.

---

## Branch Structure

- `main` → Production branch (Release only by Admin)
- `dev` → Active development branch
- `feature/*` → Individual feature branches

---

## IMPORTANT RULES

1. Never push directly to `main`.
2. Do not work directly on `dev`.
3. Always create a feature branch from `dev`.
4. All changes must go through Pull Request review.
5. Only Admin merges `dev` into `main`.

---

## Development Workflow

### Step 1 – Sync Development Branch

```bash
git checkout dev
git pull