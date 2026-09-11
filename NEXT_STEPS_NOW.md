# 🎯 Next Steps - DO THIS RIGHT NOW

## The Problem
You got this error:
```
Error: Failed to run sql query: ERROR: 42P01: relation "orders" does not exist
```

## The Solution
You need to run the database setup files in the correct order.

---

## 📋 DO THIS (Step by Step)

### Step 1: Go to Supabase Dashboard
1. Open: https://app.supabase.com
2. Select your RUFA ELAN project
3. On the left sidebar, click **"SQL Editor"**
4. Click **"New Query"** (top right)

### Step 2: Copy the Main Schema File
1. Open this file in your editor/file browser:
   ```
   c:\Users\USER\Desktop\rufa-elan\supabase\schema.sql
   ```
2. **Copy the entire contents** (Ctrl+A, then Ctrl+C)

### Step 3: Paste and Run
1. In Supabase SQL Editor, paste the contents (Ctrl+V)
2. Click **"Run"** button (bottom right)
3. Wait for it to complete (should take a few seconds)
4. You should see: **"No errors"** ✅

### Step 4: Run Payment Enhancements (Optional)
1. Click **"New Query"**
2. Open this file:
   ```
   c:\Users\USER\Desktop\rufa-elan\supabase\setup_payments_table.sql
   ```
3. Copy entire contents
4. Paste in Supabase SQL Editor
5. Click **"Run"**
6. Wait for success ✅

### Step 5: Verify It Worked
1. Click **"New Query"**
2. Run this query:
   ```sql
   SELECT COUNT(*) FROM orders;
   ```
3. Should return: `0` (table exists but no data)

---

## ✅ After That's Done

1. Terminal 1: `cd backend && npm run dev`
2. Terminal 2: `cd frontend && npm run dev`
3. Open: http://localhost:3000
4. Create an order
5. Click "Pay Now"
6. Use test card: **4084084084084081**
7. Payment should complete! 🎉

---

## ⚠️ Important Reminders

- Run `schema.sql` **FIRST**
- Then run `setup_payments_table.sql` (optional)
- Copy the **entire** file contents
- Paste in Supabase SQL Editor
- Click "Run"

---

## 📖 More Details?

See: `IMPORTANT_DATABASE_SETUP.md`

---

**That's it!** You're 90% done. Just run those SQL files and you're good to go! 🚀
