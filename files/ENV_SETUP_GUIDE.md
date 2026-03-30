# 🚀 Setup Guide - How to Use the ENV Files

## **What You Have Now:**

```
.env.local        ← Your ACTUAL keys go here (NEVER share!)
.env.example      ← Template showing what to fill in
.gitignore        ← Prevents uploading secrets to GitHub
vite.config.js    ← Vite configuration
package.json      ← Dependencies
README.md         ← Full documentation
... (and all your React components)
```

---

## **STEP-BY-STEP SETUP:**

### **Step 1: Copy `.env.local` to Your Project** 📁

1. Download `.env.local` from outputs folder
2. Put it in your project root (same level as `package.json`)

```
your-project/
├── .env.local        ← PUT IT HERE
├── package.json
├── src/
└── vite.config.js
```

### **Step 2: Get Your Supabase Keys** 🔑

1. Go to **supabase.com**
2. Log into your project
3. Click **Settings** (gear icon bottom left)
4. Click **API** (in the left menu)
5. You'll see your **URL** at the top
6. Copy it (looks like: `https://abc123.supabase.co`)

### **Step 3: Paste URL into `.env.local`** 📝

Open `.env.local` in your code editor and replace:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
```

With your actual URL:

```
REACT_APP_SUPABASE_URL=https://abc123def.supabase.co
```

### **Step 4: Get Your Anon Key** 🔐

Still on the **Settings → API** page in Supabase:

1. Look for **"anon public"** section
2. Copy the long key (starts with `eyJ...`)
3. It's like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`

### **Step 5: Paste Anon Key into `.env.local`** ✏️

Replace:

```
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

With your actual key from Supabase.

### **Step 6: Leave NVIDIA Key Alone** ✓

This one is already done:

```
REACT_APP_NVIDIA_API_KEY=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
```

**Don't change it!**

### **Step 7: Save `.env.local`** 💾

Press `Ctrl+S` (Windows) or `Cmd+S` (Mac)

### **Step 8: Restart Your App** 🔄

In terminal:

```bash
# Stop your app
Ctrl+C

# Restart it
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 123 ms

➜  Local:   http://localhost:5173/
```

**Done! 🎉**

---

## **What Each File Does:**

| File | Purpose |
|------|---------|
| `.env.local` | **YOUR KEYS GO HERE** (secret!) |
| `.env.example` | Template showing format |
| `.gitignore` | Tells Git to NOT upload `.env.local` |
| `vite.config.js` | Vite app configuration |

---

## **VERIFY IT WORKS:**

1. Open your app: `http://localhost:5173`
2. Open browser console (`F12`)
3. You should **NOT see errors** like:
   - "SUPABASE_URL is undefined"
   - "API key missing"
4. Try signing up with an email
5. If it works = ✅ SUCCESS!

---

## **WHAT YOUR `.env.local` SHOULD LOOK LIKE:**

```
REACT_APP_SUPABASE_URL=https://qwerty123abc.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZXJ0eS1iYWRjLWFiYy1kZWYwMTIzNDU2Nzg5MCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzExMzc4OTAwLCJleHAiOjE4NjkxNDUzMDB9.someRandomLongString123...
REACT_APP_NVIDIA_API_KEY=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
```

---

## **IMPORTANT SECURITY NOTES:** 🔒

❌ **NEVER:**
- Share your `.env.local` with anyone
- Upload it to GitHub
- Paste keys in public Discord/forums
- Commit it to version control

✅ **DO:**
- Keep it private and local only
- Use `.gitignore` to prevent accidents
- Regenerate keys if you think they're leaked

---

## **TROUBLESHOOTING:**

### **App won't start**
```
✓ Check .env.local is in right location (project root)
✓ Restart with: npm run dev
✓ Check for typos in keys
```

### **"Cannot read property of undefined"**
```
✓ Your .env.local file doesn't exist OR
✓ Keys are formatted wrong (extra spaces?)
✓ Restart npm run dev
```

### **API errors in console**
```
✓ Copy keys again (maybe pasted wrong)
✓ Check URL ends with .supabase.co
✓ Check anon key is long (200+ characters)
```

---

## **FILE CHECKLIST:** ✅

- [ ] Downloaded `.env.local` file
- [ ] Put it in project root
- [ ] Got Supabase URL from Settings → API
- [ ] Got Supabase anon key from same page
- [ ] Pasted both into `.env.local`
- [ ] Saved file
- [ ] Restarted `npm run dev`
- [ ] App loads without errors
- [ ] Can see geopolitical fact on dashboard
- [ ] Ready to analyze! 🚀

---

**That's it! You're all set!** 🎉

The app will now:
- ✅ Talk to Supabase
- ✅ Save your briefings
- ✅ Authenticate users
- ✅ Call NVIDIA AI
- ✅ Store geopolitical facts

**Go build something amazing! 🚀**
