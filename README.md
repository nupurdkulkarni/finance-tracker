# Couple Finance

Free Expo React Native starter for personal and collaborative couple finances.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Create a Supabase project.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
6. Run `npx expo start`.

The current starter includes authentication and a protected dashboard. The schema includes personal/couple workspaces, members, transactions, categories, payment methods, RLS, and realtime transactions.

## APK

Run `npm install -g eas-cli`, `eas login`, `eas build:configure`, then `eas build --platform android --profile preview`.
