# Threat Model (STRIDE)

| Category | Example Threats | Mitigations |
|----------|-----------------|-------------|
| **Spoofing** | Use of stolen credentials | JWT signed with secret and validated; tokens tied to `tokenVersion` in DB |
| **Tampering** | Modification of requests | `helmet` and Express validation, HTTPS enforcement |
| **Repudiation** | Denying an action | Requests and errors are logged with user identity |
| **Information Disclosure** | Leaking sensitive data | Least privilege access, secrets kept out of repo |
| **Denial of Service** | Flooding the API | Rate limiting can be added, logs help detect abuse |
| **Elevation of Privilege** | Bypassing roles | Authorization middleware restricts routes by role |

This model identifies common risks and how the current implementation addresses them. Further improvements can be discussed during security reviews.
