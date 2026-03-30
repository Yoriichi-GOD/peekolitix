# 📥 BACKEND SETUP INSTRUCTIONS

Follow these steps **exactly** to setup the backend.

---

## **STEP 1: Download All Files**

You should have these 4 files:
- ✅ `server.js`
- ✅ `package.json.txt` (rename to `package.json`)
- ✅ `env.txt` (rename to `.env`)
- ✅ `.gitignore.txt` (rename to `.gitignore`)

---

## **STEP 2: Create Backend Folder**

In your terminal (in your main project folder):

```bash
mkdir backend
cd backend
```

---

## **STEP 3: Copy Files Into Backend Folder**

Put these 4 files into the `backend/` folder:

1. `server.js` → Copy as-is
2. `package.json.txt` → Rename to `package.json`
3. `env.txt` → Rename to `.env`
4. `.gitignore.txt` → Rename to `.gitignore`

### **How to Rename Files:**

**Windows:**
- Right-click file → "Rename"
- Remove `.txt` extension

**Mac/Linux:**
```bash
mv package.json.txt package.json
mv env.txt .env
mv .gitignore.txt .gitignore
```

---

## **STEP 4: Verify Folder Structure**

Your `backend/` folder should now look like:
```
backend/
├── server.js
├── package.json
├── .env
├── .gitignore
```

---

## **STEP 5: Install Dependencies**

In terminal (make sure you're in `backend/` folder):

```bash
npm install
```

Wait for it to complete. You'll see lots of output.

When done, you'll have a `node_modules/` folder.

---

## **STEP 6: Start Backend**

```bash
npm run dev
```

You should see:
```
============================================================
🚀 POLITICAL INTELLIGENCE BACKEND
============================================================
✅ Server running on: http://localhost:3001
📊 API endpoint:     POST /api/analyze
🏥 Health check:     GET /health
============================================================
Waiting for requests...
```

**Keep this terminal running!**

---

## **STEP 7: Open Another Terminal**

Open a NEW terminal window (don't close the first one)

Go back to your main project folder:
```bash
cd ..
```

---

## **STEP 8: Start Frontend**

```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

---

## **STEP 9: Test It**

1. Open http://localhost:5173 in browser
2. Type a question
3. Click "Analyze"
4. Wait 3-5 seconds
5. **Should get an answer!** ✅

---

## **TROUBLESHOOTING**

### **Error: "npm: command not found"**
- Node.js not installed
- Download from: nodejs.org
- Restart terminal after installing

### **Error: "Port 3001 already in use"**
- Something else is using port 3001
- Change PORT in `.env` to 3002 or 3003
- Restart backend

### **Error: "Cannot find module"**
- Dependencies not installed
- Run: `npm install` in backend folder
- Make sure you're in the `backend/` folder

### **No response from API**
- Check both terminals are running
- Check http://localhost:3001/health in browser
- Should show: `{"status":"ok",...}`

---

## **FILE CONTENTS REFERENCE**

### **server.js**
- Main backend server code
- Handles `/api/analyze` requests
- Proxies to NVIDIA API

### **package.json**
- Lists dependencies (express, cors, etc.)
- Tells npm what to install

### **.env**
- Stores your API key
- NEVER commit this to GitHub
- .gitignore prevents accidents

### **.gitignore**
- Tells Git to ignore node_modules, .env, etc.
- Prevents uploading secrets

---

## **RUNNING BOTH TOGETHER**

```
Terminal 1:
cd backend
npm run dev
→ Shows: "🚀 Server running on http://localhost:3001"

Terminal 2:
npm run dev
→ Shows: "➜ Local: http://localhost:5173/"
```

Both must be running!

---

## **QUICK CHECKLIST**

- [ ] Downloaded all 4 files
- [ ] Created `backend/` folder
- [ ] Copied files into `backend/`
- [ ] Renamed `.txt` files (remove `.txt` extension)
- [ ] Ran `npm install` in backend folder
- [ ] Ran `npm run dev` in backend (Terminal 1 active)
- [ ] Ran `npm run dev` in main project (Terminal 2 active)
- [ ] Opened http://localhost:5173
- [ ] Asked a question
- [ ] Got an answer! ✅

---

**Done! Backend is working! 🎉**

If stuck, which step failed? Tell me the step number!
