# Buy Me Zobo — Product Changes

> Working implementation brief for moving Buy Me Zobo from a frontend demo to a real creator-support product.

## Direction

Keep the current product concept:

> A Nigerian-first creator support platform where people can create a public page, share a link, receive small gifts/support, collect messages, and withdraw their earnings.

The next phase should focus more on product functionality than another full visual redesign.

---

# 1. Authentication

## Decision

**Do not implement standalone authentication in Buy Me Zobo yet.**

Buy Me Zobo will dogfood **FirstLayer** once FirstLayer is ready enough to serve as the identity provider.

## What to do now

Keep authentication behind a clean application boundary.

Buy Me Zobo should own its internal `accounts.id`, while FirstLayer later supplies the external identity:

```text
FirstLayer user
      │
      ▼
auth_provider_user_id
      │
      ▼
Buy Me Zobo account
      │
      ▼
creator profile
```

Avoid:

- Supabase Auth coupling;
- fake production auth;
- storing passwords inside Buy Me Zobo;
- making dashboard routes appear secure when they are not.

The current demo login can remain clearly labelled as demo-only during development.

## FirstLayer integration later

When FirstLayer is integrated:

- signup/login is handled through FirstLayer;
- email verification/reset/session management is handled through FirstLayer;
- Buy Me Zobo creates or resolves an internal `accounts` record;
- dashboard requests resolve the authenticated account;
- creator ownership checks use the internal account ID;
- authorization/RLS is enabled against the authenticated identity.

---

# 2. Payments

Payments are the most important production feature after persistent creator profiles.

## Support experience

Supporters should be able to:

1. Open a creator page.
2. Choose a support amount.
3. Optionally enter their name.
4. Optionally leave a message.
5. Choose public/private visibility.
6. Pay without creating a Buy Me Zobo account.
7. Receive clear payment success/failure feedback.

## Amount selection

Support both the Zobo metaphor and familiar Naira amounts.

Recommended model:

```text
Creator chooses:
1 Zobo = ₦500 / ₦1,000 / custom supported value

Supporter sees:
🥤 ×1
🥤 ×3
🥤 ×5
Custom amount
```

Do not make supporters perform arithmetic to understand what they are paying.

## Payment architecture

The browser should never declare a payment successful.

Flow:

```text
Creator page
    │
    ▼
Create payment intent/reference on server
    │
    ▼
Payment provider checkout
    │
    ├── redirect/callback ──► UI status only
    │
    ▼
Verified webhook
    │
    ▼
support_transactions.status = successful
    │
    ▼
Creator balance/support history updates
```

The verified provider webhook is the source of truth.

## Provider integration

Keep provider-specific code behind an adapter:

```text
payments/
  provider.js
  paystack.js
  flutterwave.js
```

The rest of Buy Me Zobo should call product-level functions such as:

```js
createSupportPayment()
verifyWebhook()
getPaymentStatus()
createTransferRecipient()
requestPayout()
```

rather than scattering provider API calls through Svelte components.

## Required payment states

Handle at least:

```text
pending
successful
failed
refunded
partially_refunded
```

The interface should account for:

- supporter closes checkout;
- provider timeout;
- duplicate webhook;
- delayed webhook;
- failed card/transfer;
- callback arrives before webhook;
- supporter refreshes success page;
- payment succeeds but notification fails.

## Fees

Persist the fee calculation on each transaction.

Do not rely on the current fee percentage forever because pricing can change.

Store:

```text
support amount
platform fee
provider fee
total charged
creator net amount
```

---

# 3. Creator page

The creator page should become the core of the product rather than merely a profile plus payment widget.

## URL

Target:

```text
buymezobo.com/nelson
```

instead of:

```text
buymezobo.com/creator/nelson
```

Reserve application routes such as:

```text
/admin
/api
/dashboard
/login
/logout
/pricing
/settings
/signup
```

## Profile content

A creator should be able to configure:

- display name;
- username;
- profile image;
- cover image;
- short bio;
- creator category;
- optional location;
- social links;
- website links;
- support unit amount;
- support CTA/message;
- page published/paused status.

## Links

Creators should be able to add, edit, reorder, show, and hide links.

Example:

```text
Nelson Wey
Software engineer building internet things.

[ Portfolio ]
[ YouTube ]
[ X / Twitter ]
[ GitHub ]

🥤 Buy Nelson a Zobo
```

## Page states

Support clear states for:

### Draft

Only the creator can preview it.

### Published

Publicly accessible and able to accept support.

### Paused

Public profile may remain visible, but the support form is disabled with an explicit message.

## Sharing

Production creator pages should include:

- page title;
- meta description;
- canonical URL;
- Open Graph metadata;
- X/Twitter card metadata;
- generated social preview image later.

## Mobile

The support action should remain immediately visible on a phone.

Avoid long decorative sections pushing the support UI far below the creator identity.

## Component structure

Break the current large creator page into smaller product components:

```text
CreatorPage.svelte
├── CreatorHeader.svelte
├── CreatorIdentity.svelte
├── CreatorLinks.svelte
├── SupportWidget.svelte
├── AmountPicker.svelte
├── SupporterDetails.svelte
├── PaymentSummary.svelte
├── GiftWall.svelte
└── CreatorFooter.svelte
```

---

# 4. Supporter privacy and public gift wall

The current product can display supporter names/messages publicly.

That must become an explicit supporter choice.

## Payment form

Add two independent controls:

```text
[ ] Show my name publicly
[ ] Show my message publicly
```

Recommended defaults:

```text
OFF
OFF
```

Do not use a single "anonymous" toggle because name and message visibility are separate choices.

Examples:

### Fully public

```text
Tomi
"Keep building this!"
₦2,000
```

### Public message, private name

```text
Anonymous
"Keep building this!"
₦2,000
```

### Public name, private message

```text
Tomi
Sent a Zobo
₦2,000
```

### Fully private

The transaction appears only in the creator dashboard and never on the public gift wall.

## Creator moderation

Creators should be able to hide a public gift/message without deleting the underlying transaction.

Later moderation actions can include:

- hide from public page;
- report abusive content;
- block repeated abuse;
- restore hidden item.

Financial records must never be deleted simply because a creator hides a message.

## Sensitive information

Never expose on the public creator page:

- supporter email;
- payment references;
- phone number;
- raw provider payload;
- creator bank information;
- payout information.

## Public gift-wall query

Only show successful payments that have explicit visibility consent.

Conceptually:

```text
payment.status == successful
AND creator_hidden == false
AND (
  show_name_publicly == true
  OR show_message_publicly == true
)
```

---

# 5. Recommended implementation sequence

## Phase 1 — Persistent creator profiles

- Add PostgreSQL/Supabase database.
- Add `accounts` and `creator_profiles`.
- Seed development creators.
- Make public creator pages database-backed.
- Add page publishing/pausing.
- Add creator links.

Auth is still deferred.

## Phase 2 — Payments

- Add provider abstraction.
- Add payment initialization server route.
- Add provider callback status page.
- Add signed webhook verification.
- Add idempotent payment-event handling.
- Persist successful supporter gifts.

## Phase 3 — Privacy and gift wall

- Add visibility controls to checkout.
- Default both controls to private.
- Render only consented content publicly.
- Add creator hide/unhide moderation.

## Phase 4 — Payout infrastructure

- Tokenize/store payout recipient reference.
- Show masked bank destination.
- Derive available balance from trusted payment records.
- Add payout requests/status.
- Add provider payout webhook handling.

## Phase 5 — FirstLayer dogfood

- Replace demo login with FirstLayer.
- Resolve authenticated FirstLayer users to Buy Me Zobo `accounts`.
- Protect dashboard routes.
- Enable creator ownership authorization.
- Add RLS/server policies.
- Remove the remaining browser-local creator persistence.

---

# 6. Explicitly not part of this pass

Do not let the scope mutate into a small fintech empire before the MVP works.

Defer:

- recurring memberships;
- supporter accounts;
- creator discovery marketplace;
- teams;
- multiple creator pages per account;
- goals/campaigns;
- comments/replies;
- advanced analytics;
- themes marketplace;
- multi-currency balances.

Those become useful after the basic loop works:

```text
create page
→ share page
→ supporter pays
→ transaction is verified
→ creator sees support
→ creator receives payout
```

That loop is the product.
