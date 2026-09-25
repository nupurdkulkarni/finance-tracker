# NuPra Finance 💍📊

**NuPra Finance** is a smart, collaborative couple and personal finance mobile application built with React Native (Expo) and Supabase cloud sync. It allows individuals and couples to track incomes, expenses, monthly spending limits, financial goals, stock market investments, bills, and detailed statistics with live real-time synchronization.

---

## ✨ Features

- 👤 **Personal & Collaborative Couple Modes**: Toggle between your private personal space and shared couple workspace with live real-time updates.
- 📸 **Photo Avatar & Profiles**: Select from vibrant avatars or upload a custom profile photo during sign up.
- 💰 **Income & Expense Tracking**: Instant transaction logger with who-paid indicators (You vs Partner vs Split 50/50).
- 🏷️ **Color-Coded Default & Custom Categories**:
  - `Salary` (Emerald)
  - `Rent` (Indigo)
  - `Food` (Amber)
  - `Leisure` (Rose)
  - `Travel` (Cyan)
  - `Health` (Red)
  - `Hobby` (Violet)
  - `Groceries` (Teal)
  - `Investments` (Blue)
  - `Bills & Utilities` (Slate)
  - Add custom categories with custom icons, color palettes, and monthly budget limits.
- 🎯 **Couple Finance Goals**: Track shared and personal dreams (Emergency Fund, Dream Vacations, House Downpayment, Wedding) with live progress bars and **"Amount Needed More"** calculation, plus one-tap quick savings contribution.
- 📈 **Stock Market & Investment Tracker**: Dedicated section tracking monthly stock, ETF, mutual fund, crypto, and SIP investments made by you, your partner, and together. Shows invested capital breakdown and overall returns.
- 📊 **Smart Statistics & Visual Plots**:
  - Individual vs Together Savings plots (Monthly & Yearly).
  - Individual vs Together Expense split bars.
  - Category spending breakdown.
  - Stock portfolio allocation split.
  - Goal target completion meters.
- 💳 **Bills & Subscriptions Tracker**: Unpaid vs paid bills, due date alerts, and one-tap "Mark Paid" action.
- 💸 **Custom Payment Methods**: Credit Card, Cash, Bank Transfer, UPI / Pix, and Debit Card.
- 🌎 **Multi-Currency (Rupees ₹ & Euros €)**: Instant currency toggle between INR (₹) and EUR (€).
- 🔎 **Advanced Filters**: Search transactions, filter by date (This Month, Last Month, Year), category, payer, and transaction type.

---

## 🚀 Setup & Cloud Sync

### 1. Configure Supabase (Cloud Database & Realtime)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
4. All user transactions, goals, investments, and profiles will sync live across both partners' devices.

### 2. Run the App
```bash
npm install
npx expo start
```

---

## 📱 Building the Android APK (`NuPra Finance.apk`)

### Option A: GitHub Actions (Automated Cloud APK)
1. Push your repository to GitHub (`main` or `master` branch).
2. The included GitHub workflow [`.github/workflows/android.yml`](file:///.github/workflows/android.yml) will automatically build and export **`NuPra Finance.apk`** as an artifact download.

### Option B: Expo EAS Build
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

---

## 🔒 Safe Database & Git Migrations

The database schema in [`supabase/schema.sql`](file:///supabase/schema.sql) uses idempotent statements (`IF NOT EXISTS`, safe indexes, non-destructive RLS policies). You can push code improvements via Git anytime without overwriting or losing existing user inputs.
