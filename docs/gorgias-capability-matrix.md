# Gorgias Capability Matrix

Status date: 2026-04-09

## Purpose
Track what Gorgias appears to support in-product versus what is clearly documented in the public developer API.

## Read/Write Core

| Capability | In Gorgias product | Public API docs | Build in v1? | Notes |
|---|---|---|---|---|
| Read tickets/conversations | Yes | Yes | Yes | Core requirement |
| Read ticket messages | Yes | Yes | Yes | Core requirement |
| Create/send ticket message | Yes | Yes | Yes | Human approved only |
| Read channel metadata | Yes | Partly | Yes | Normalize internally |

## Social Moderation and Reactions

| Capability | In Gorgias product | Public API docs | Build in v1? | Notes |
|---|---|---|---|---|
| Hide Facebook comment | Yes | Unverified public write operation | No | Product-supported, API not clearly documented |
| Unhide Facebook comment | Yes | Unverified public write operation | No | Same issue |
| Hide Instagram comment | Appears supported in product flows | Unverified public write operation | No | Needs explicit API proof |
| Like Facebook comment | Yes | Unverified public write operation | No | Product docs mention it, public API path unclear |
| Unlike Facebook comment | Yes | Unverified public write operation | No | Same issue |
| Like Instagram comment | No | No | No | Product docs state unavailable |
| Emoji reactions on Messenger/Instagram DMs | Not clearly documented | No documented API found | No | Assume unavailable for now |

## Product Decision
- Build only against capabilities clearly documented in the public developer API
- Keep moderation and reactions behind a separate `verified-later` bucket
- Do not expose buttons in production for undocumented operations

## If We Want to Test Unverified Features Later
1. Validate with a non-production Gorgias account
2. Confirm exact endpoint or action payload with Gorgias support
3. Record supported behavior in this file before shipping UI controls

## Source Links
- [Gorgias developer reference](https://developers.gorgias.com/reference)
- [Create a message](https://developers.gorgias.com/reference/create-ticket-message)
- [Event object](https://developers.gorgias.com/v1.1/reference/the-event-object)
- [Connect your Facebook and Instagram](https://docs.gorgias.com/en-US/connect-your-social-channels-facebook-instagram-81830)
- [Facebook comments, recommendations and ad comments](https://docs.gorgias.com/en-US/facebook-comments-recommendations-and-ad-comments-81784)
- [Instagram Comments](https://docs.gorgias.com/en-US/instagram-comments-81785)
- [Instagram Direct Messages](https://docs.gorgias.com/en-US/instagram-direct-messages-81905)
