# ✅ SOLUTION: Backend Proxy Setup

## **The Problem**
CORS blocks direct API calls from Claude artifacts (and browsers). You need a **backend server** to make the API call.

---

## **Setup (5 Minutes)**

### **Step 1: Create Backend Folder**
```bash
mkdir backend
cd backend
```

### **Step 2: Copy Backend Files**
Create these two files in the `backend/` folder:

**File 1:** `package.json`
```json
{
  "name": "political-intelligence-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "node-fetch": "^3.3.2"
  }
}
```

**File 2:** `server.js`
Download from: `backend-server.js` in outputs

### **Step 3: Install Dependencies**
```bash
npm install
```

### **Step 4: Create `.env` File**
In `backend/` folder, create `.env`:
```
NVIDIA_API_KEY=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
PORT=3001
```

### **Step 5: Start Backend**
```bash
npm run dev
```

You should see:
```
🚀 Political Intelligence Backend running on http://localhost:3001
📊 API endpoint: POST http://localhost:3001/api/analyze
```

---

## **Step 6: Update Frontend**

Use: `dashboard-with-backend.jsx`

It automatically calls the backend instead of NVIDIA API directly.

**In your React project:**
1. Replace your dashboard with `dashboard-with-backend.jsx`
2. Make sure backend is running (Step 5)
3. Start your React app: `npm run dev`
4. **Now it will work!** ✅

---

## **Full Setup Checklist**

### **Backend Folder Structure:**
```
backend/
├── package.json
├── server.js
├── .env
└── node_modules/
```

### **Start Both:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Should show: 🚀 running on http://localhost:3001

# Terminal 2 - Frontend
npm run dev
# Should show: ➜  Local: http://localhost:5173/
```

---

## **How It Works**

```
React Dashboard
      ↓
     (Click "Analyze")
      ↓
Backend Server (localhost:3001)
      ↓
NVIDIA API (integrate.api.nvidia.com)
      ↓
Returns Response
      ↓
Frontend Shows Results ✅
```

---

## **Troubleshooting**

### **Error: "Backend Down"**
- Check Terminal 1: Is backend running?
- Did you run `npm run dev` in backend folder?
- Check port 3001 is free: `lsof -i :3001`

### **Error: "Connection refused"**
- Backend is not running
- Start it: `npm run dev` in backend folder

### **API Still returning nothing**
- Check backend logs (Terminal 1)
- Should see: `📊 Analyzing: ...`
- If error, screenshot and share

### **Deployment (Production)**
When deploying, change backend URL from `http://localhost:3001` to your deployed backend URL:
```javascript
const BACKEND_URL = 'https://your-backend-domain.com';
```

---

## **Files to Use**

| File | Purpose |
|------|---------|
| `backend-server.js` | Backend proxy server |
| `backend-package.json` | Backend dependencies |
| `dashboard-with-backend.jsx` | Frontend dashboard |

---

**That's it! Now your app will get answers! 🚀**
