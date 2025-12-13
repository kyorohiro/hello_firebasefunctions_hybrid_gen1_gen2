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

## Build process during Firebase deploy

### Why `npm run build` is not used in `predeploy`

During `firebase deploy`, this project **does not execute `npm run build`**.
Instead, the TypeScript compiler is invoked directly:

```bash
node ./node_modules/typescript/bin/tsc -p tsconfig.json
```

### Reason

The Firebase CLI internally uses its own bundled version of npm.
In this environment, running npm run build from predeploy may fail
before the build step starts (for example, due to stdin or script-shell
issues inside the Firebase runtime).

To ensure deterministic and stable deployments, we intentionally bypass
npm run and invoke tsc directly via node.

### Notes

- The logical build definition still exists in package.json.

- This direct invocation is used only during Firebase deployment.

- For local development, continue to use:

```
npm run build
```

- If Firebase CLI / npm behavior changes in the future, this step can be
reverted back to npm run build.


### Deployment safety

Before compiling, the output directory is cleaned to prevent stale artifacts:

```
rm -rf lib

```

This guarantees that each deployment uses a fresh build output.



# 🚧 **Official note on gen1→gen2 migration**

Firebase officially states:

> *“Upgrading from 1st Gen to 2nd Gen is not yet supported.”*  
> (https://firebase.google.com/docs/functions/2nd-gen-upgrade)

This means that functions **cannot be converted in-place** from gen1 to gen2
using the same name and codebase.

While it is technically possible in many cases to delete a gen1 function
and recreate a gen2 function with the same name, this **is not guaranteed**
by Firebase documentation and should not be treated as a formally supported
migration path without exhaustive testing.



## Migration notes (gen1 -> gen2): common pitfalls

Migrating from Firebase Functions gen1 to gen2 is not just a code change.
Most issues come from deployment rules, URLs, and operational constraints.

### 1) No in-place upgrade (same name)
You cannot "upgrade" an existing gen1 function to gen2 under the same function name.
Deploying a gen2 function with the same name as a gen1 function fails.

**Implication:**
- Use a new name for gen2 during the migration, or
- Accept a destructive cutover (delete gen1 first, then create gen2).

### 2) URL / endpoint changes
gen2 is backed by Cloud Run and introduces different URLs.
Even though Cloud Functions URLs exist for gen2, planning endpoint compatibility is critical.

**Implication:**
- Released clients that hardcode gen1 URLs must be migrated intentionally.

### 3) Auth user lifecycle triggers are gen1-only
Triggers such as `auth.user().onCreate` and `auth.user().onDelete` are gen1-only (as of now).

**Implication:**
- A gen2-only architecture is not feasible if you rely on these hooks.
- gen1 must remain until the platform provides gen2 equivalents.

### 4) Deployment becomes the bottleneck (WRITE quota / large projects)
With many functions (e.g., 200+), deployments become slow and fragile.
This is especially true in hybrid gen1/gen2 projects.

**Implication:**
- Always deploy in small units using `--only`.
- Avoid "deploy everything" workflows.

### 5) Permissions / invoker differences
Public HTTP behavior differs across gen1/gen2 and may require explicit IAM settings.
Assume nothing is public until verified.

**Implication:**
- Verify invocation permissions for each function after deployment.
- Document the intended exposure policy (public vs internal).

### 6) Build & packaging differences
Monorepo/workspaces and TypeScript builds can behave differently under Firebase CLI.
`$RESOURCE_DIR` and workspace behavior are frequent sources of build surprises.

**Implication:**
- Keep each codebase self-contained for build reproducibility.
- Prefer deterministic `predeploy` scripts per codebase.

### 7) Function count / per-region limits
Function count limits exist per region, and gen2 counts interact with Cloud Run services.
Large projects must plan function/service growth carefully.

**Implication:**
- Reduce "1 endpoint = 1 function" patterns.
- Prefer fewer gen2 functions with internal routing (Express Router) when possible.


# deploy 

```
cd ./functions/gen1
npm i
cd ./functions/gen2
npm i
firebase deploy --only "functions:gen1:helloV1"
firebase deploy --only "functions:gen1:hourlyJobV1"
firebase deploy --only "functions:gen1:onUserDeleteV1"
firebase deploy --only "functions:gen1:helloV1Proxy"

firebase deploy --only "functions:gen2:helloV2"
firebase deploy --only "functions:gen2:pingLogV2"
firebase deploy --only "functions:gen2:helloV1"

```

https://asia-northeast1-hello-funcs-v1v2.cloudfunctions.net/helloV1
https://asia-northeast1-hello-funcs-v1v2.cloudfunctions.net/helloV2


# setting 

```
gcloud auth login
gcloud config set project hello-funcs-v1v2

gcloud functions add-iam-policy-binding helloV1 \
  --region=asia-northeast1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"
```