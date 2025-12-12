## Why this repository exists

This repository intentionally contains a **hybrid setup of Firebase Functions gen1 and gen2**.

The reason is **not preference**, but **technical and operational constraints** that exist
in real-world production systems.

---

## Node.js runtime constraints

As of now:

- **Firebase Functions gen1 does NOT support Node.js 22**
- gen1 officially supports **Node.js 16 / 18 / 20**
- **gen2 supports newer Node.js versions (including Node.js 22)**

Because of this:

- Upgrading the entire project to Node.js 22 **breaks gen1 functions**
- Keeping gen1 requires staying on **Node.js 20**
- Introducing gen2 often requires newer Node.js features

➡️ **A single Node.js version cannot satisfy both generations.**

---

## Existing production URLs must keep working

This project reflects a **real production situation**:

- gen1 functions are already **released**
- Mobile and client applications are already using **gen1 URLs**
- Changing those URLs would:
  - break released applications
  - require forced client updates
  - introduce unnecessary operational risk

Therefore:

- gen1 endpoints must **continue to exist**
- even while new development moves to gen2

---

## User lifecycle hooks are gen1-only (critical)

As of today:

- Firebase Authentication user lifecycle triggers such as:
  - `auth.user().onCreate`
  - `auth.user().onDelete`

➡️ **exist only in Firebase Functions gen1**

There is **no equivalent API in gen2** yet.

---

## Why this limitation matters

User lifecycle hooks are commonly used for:

- cleaning up user-related data
- unlinking external identity providers
- revoking access tokens
- maintaining referential integrity
- compliance and audit logging

These hooks are often part of **critical business logic**.

Removing them is **not an option**.

---

## Why a gen2-only architecture is not feasible (yet)

Even if all HTTP endpoints were migrated to gen2:

- Authentication user lifecycle hooks **must remain in gen1**
- Removing gen1 would break:
  - data cleanup
  - account unlinking
  - internal consistency

➡️ **A gen2-only Firebase Functions project is not currently possible**
for systems that rely on these hooks.

---

## Why not migrate everything at once

A full migration from gen1 to gen2 sounds ideal, but in practice:

- It increases review and testing cost
- It increases deployment risk
- It creates large diffs that are hard to validate
- It requires tight coordination with client releases

This repository demonstrates a **step-by-step migration strategy** instead:

- keep gen1 stable
- introduce gen2 incrementally
- validate behavior in parallel
- migrate only when it is safe

---

## Intentional hybrid design

Yes, this repository is a **hybrid / hodgepodge** by design.

Real systems rarely allow:

- clean rewrites
- perfect timing
- ideal migrations

This project documents:

- what actually works
- what breaks
- what Firebase does not clearly document

---

## Summary

- gen1 and gen2 **must coexist** in real-world projects
- Node.js version support differs between generations
- Existing production URLs cannot be changed lightly
- **Authentication user lifecycle hooks are gen1-only**
- A hybrid architecture is sometimes the only safe option

This repository exists to make these constraints **explicit and understandable**.


firebase deploy --only "functions:gen1:helloV1"
firebase deploy --only "functions:gen2:helloV2"

gcloud auth login
gcloud config set project hello-funcs-v1v2

gcloud functions add-iam-policy-binding helloV1 \
  --region=asia-northeast1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"