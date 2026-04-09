# SecretGift

A Next.js app for sending **secret messages** and **virtual gifts** with timed unlocks.

## User Guide (English)

### App UI description

- **Landing page**: Intro to SecretGift with sign-in/sign-up entry points.
- **Auth pages (`/auth/sign-in`, `/auth/sign-up`)**: Email/password and OAuth login controls.
- **Dashboard header**:
  - left: page title + Supabase connection badge
  - right: sign-out button
- **Received interaction summary panel**:
  - your avatar + username at top-right (click avatar to upload/update photo)
  - 4 type cards (`water_splash`, `black_soot`, `food`, `flower`) with counters
  - interaction list (sender + time), click a row to open animation popup
- **Animation popup**:
  - sender/receiver avatars at top
  - square canvas animation stage in center
  - interaction label + time metadata
  - sender message dialog area
  - replay overlay button appears at animation end
  - share/download action buttons under the stage
- **Share card panel**:
  - QR code + public URL
  - copy link button
  - download share card image button
- **Public profile page (`/u/[username]`)**:
  - receiver profile summary
  - interaction send form (type + optional message + submit)

### 1) Sign in and open dashboard

- Sign in with email/password or OAuth (Google).
- After login, go to Dashboard to see your profile, received interactions, and sharing tools.

### 2) Share your public profile (link + QR)

- In Dashboard, open the **Share card** section.
- Use **Copy Link** to copy your public profile URL: `/u/[your-username]`.
- Use **Download Card** to save a share image with QR code.
- Friends can:
  - click your public link, or
  - scan your QR code
  and send you an interaction.

### 3) Send interactions from public profile

- Open someone’s public page: `/u/[username]`.
- Choose one interaction type:
  - `water_splash`
  - `black_soot`
  - `food`
  - `flower`
- Optionally add a message.
- Submit to send.

### 4) View received interactions

- In Dashboard, select an interaction type card to filter.
- Click an interaction row to open the animation popup.
- The popup shows:
  - sender + receiver avatars
  - interaction animation
  - sender message (message is shown only in popup)
  - replay/share/download actions

### 5) Replay and sharing animation

- Animation waits briefly, then plays once and stops on last frame.
- A semi-transparent **Replay** button appears on the animation panel at the end.
- Press Replay to restart the animation.
- Use **Share Stage** or **Download PNG** to share/save the scene.

### 6) Upload profile avatar

- In the summary panel header, click your avatar next to `@username`.
- File picker opens directly.
- Select an image (max 5MB) to upload and update your profile photo.

### 7) Premium visibility rule

- Sender identity is controlled by `interactions_feed`:
  - premium receiver: sender identity can be visible
  - non-premium receiver: sender is hidden as anonymous
- `profiles.is_premium` is currently set manually in Supabase.

---

## User Guide (Myanmar / မြန်မာ)

### App UI အစိတ်အပိုင်းရှင်းလင်းချက်

- **Landing page**: SecretGift မိတ်ဆက်စာမျက်နှာ၊ sign-in/sign-up ဝင်ပေါက်များပါရှိသည်။
- **Auth pages (`/auth/sign-in`, `/auth/sign-up`)**: Email/Password နှင့် OAuth login control များ။
- **Dashboard header**:
  - ဘယ်ဘက်: page title + Supabase connection badge
  - ညာဘက်: sign-out button
- **Received interaction summary panel**:
  - အပေါ်ညာဘက်တွင် ကိုယ်ပိုင် avatar + username (avatar ကိုနှိပ်လျှင် upload/update)
  - `water_splash`, `black_soot`, `food`, `flower` type card ၄ခုနှင့် count
  - interaction list (sender + time) ကို click လုပ်ပြီး animation popup ဖွင့်နိုင်သည်
- **Animation popup**:
  - အပေါ်တွင် sender/receiver avatar
  - အလယ်တွင် square canvas animation stage
  - interaction label + time metadata
  - sender message ကိုပြမည့် dialog area
  - animation အဆုံးတွင် replay overlay button ပေါ်လာသည်
  - stage အောက်တွင် share/download button များ
- **Share card panel**:
  - QR code + public URL
  - copy link button
  - share card image download button
- **Public profile page (`/u/[username]`)**:
  - receiver profile summary
  - interaction ပို့ရန် form (type + optional message + submit)

### ၁) Sign in လုပ်ပြီး Dashboard ဝင်ရန်

- Email/Password သို့မဟုတ် Google OAuth ဖြင့် sign in လုပ်ပါ။
- Login ဝင်ပြီးနောက် Dashboard တွင် profile, received interactions, share tools တွေကို မြင်နိုင်ပါသည်။

### ၂) Public profile ကို Link + QR နဲ့ မျှဝေရန်

- Dashboard ထဲက **Share card** ကို သုံးပါ။
- **Copy Link** နှိပ်ပြီး `/u/[your-username]` public link ကို ကူးယူပါ။
- **Download Card** နဲ့ QR ပါတဲ့ပုံကို save လုပ်ပါ။
- သင့်သူငယ်ချင်းတွေက
  - link ကိုနှိပ်ပြီးဝင်နိုင်သလို
  - QR ကို scan လုပ်ပြီးဝင်နိုင်ပါတယ်။

### ၃) Public profile မှ interaction ပို့ရန်

- `/u/[username]` စာမျက်နှာကို ဝင်ပါ။
- Interaction type တစ်ခုရွေးပါ:
  - `water_splash`
  - `black_soot`
  - `food`
  - `flower`
- Message ကို optional ထည့်နိုင်ပါတယ်။
- Submit နှိပ်ပြီး ပို့ပါ။

### ၄) Received interactions ကြည့်ရန်

- Dashboard တွင် type card ကိုနှိပ်ပြီး filter လုပ်နိုင်ပါတယ်။
- Interaction row ကိုနှိပ်လျှင် animation popup ပွင့်ပါမည်။
- Popup ထဲမှာ:
  - sender + receiver avatar
  - interaction animation
  - sender message (list မှာမပြ၊ popup ထဲမှာသာ ပြ)
  - replay/share/download actions
  ကိုပြသပါသည်။

### ၅) Replay နှင့် animation share

- Animation သည် စတင်မီ အချိန်အနည်းငယ်စောင့်ပြီး တစ်ကြိမ် run လုပ်ကာ နောက်ဆုံး frame မှာ ရပ်ပါသည်။
- Animation panel ပေါ်တွင် နောက်ဆုံး frame ရောက်မှသာ semi-transparent **Replay** button ပေါ်လာပါသည်။
- Replay နှိပ်လျှင် animation ပြန်စပါမည်။
- **Share Stage** သို့မဟုတ် **Download PNG** ဖြင့် မျှဝေ/သိမ်းနိုင်ပါတယ်။

### ၆) Avatar တင်ခြင်း

- Summary panel header ထဲက `@username` ဘေးရှိ avatar ကိုနှိပ်ပါ။
- File picker dialog တန်းပွင့်လာပါမည်။
- Image (5MB အောက်) ရွေးပြီး profile avatar ကို update လုပ်နိုင်ပါသည်။

### ၇) Premium visibility စည်းကမ်း

- Sender identity ကို `interactions_feed` မှ ထိန်းချုပ်ပါသည်။
  - premium receiver ဖြစ်လျှင် sender ကိုမြင်နိုင်နိုင်
  - non-premium receiver ဖြစ်လျှင် anonymous (hidden) ဖြစ်ပါသည်။
- `profiles.is_premium` ကို လက်ရှိမှာ Supabase မှာ manual set လုပ်ရပါသည်။

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres)

## Project structure

```text
src/
  app/
  components/
    landing/
    layout/
  hooks/
  lib/
    supabase/
  types/
supabase/
  schema.sql
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in values in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (example: `http://localhost:3000`)

4. Run the app:

   ```bash
   npm run dev
   ```

## Supabase setup

1. Create a new Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql` to create the app tables/views (`profiles`, `messages`, `gifts`, `interactions`, `interactions_feed`) with RLS policies.
3. In Supabase Auth settings, enable your sign-in providers (email or OAuth like Google).
4. In Supabase Dashboard -> Authentication -> URL configuration, add callback URLs:
   - `http://localhost:3000/auth/callback`
   - `http://127.0.0.1:3000/auth/callback`
   - `https://YOUR-PRODUCTION-DOMAIN/auth/callback`
5. In each OAuth provider console (for example Google Cloud), add the same callback URLs.
6. Premium sender identity visibility is currently manual: set `profiles.is_premium = true` for specific users in Supabase Table Editor or SQL.

## Deploy to Vercel

1. Push this project to GitHub/GitLab/Bitbucket.
2. In Vercel, click **Add New Project** and import this repo.
3. Framework preset should be detected as **Next.js**.
4. In Vercel project settings, add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` = your production domain (example: `https://secretgift.vercel.app`)
5. Deploy once.
6. After first deploy, copy your final production URL and update:
   - Supabase -> Authentication -> URL configuration -> add  
     `https://YOUR-PRODUCTION-DOMAIN/auth/callback`
   - Any OAuth provider console (example: Google Cloud) with the same callback URL.
7. Redeploy if you changed `NEXT_PUBLIC_APP_URL`.

### Recommended Vercel settings

- Build command: `npm run build` (default)
- Output directory: `.next` (default)
- Install command: `npm install` (default)
- Node.js version: use Vercel default (or set latest LTS)

## Notes

- `src/lib/supabase/client.ts` provides a browser client.
- `src/lib/supabase/server.ts` provides a server client for App Router server components.
- `src/hooks/useAuth.ts` includes a basic auth state hook.
- `src/types/database.ts` contains starter database types for strongly typed queries.
