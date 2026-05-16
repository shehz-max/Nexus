# Nexus Startup Guide

## Step 1: Start the API Server
1. Open PowerShell
2. Copy and paste this:
```
cd C:\Users\Muhammad Umer\Desktop\IntegrationHub
npx tsx src/index.ts
```
3. You should see: `🚀 Integration Hub API is running!`

## Step 2: Start the Frontend (NEW PowerShell window)
1. Open another PowerShell window
2. Copy and paste this:
```
cd C:\Users\Muhammad Umer\Desktop\IntegrationHub\client
npm run dev
```
3. You should see: `➜ Local: http://localhost:5173`

## Step 3: Open Your Browser
Go to: http://localhost:5173

---

## Alternative: Use Batch Files
Double-click these files to start each server in a separate window:
- `start-api.bat` - Starts the API server
- `start-ui.bat` - Starts the frontend

---

## Troubleshooting

**If you see "connection refused":**
- Make sure both servers are running (check both PowerShell windows)
- Wait 3-5 seconds after starting before opening the browser

**If port 3000 is in use:**
```
netstat -ano | Select-String "3000"
```
Then kill that process by PID.

**If port 5173 is in use:**
```
netstat -ano | Select-String "5173"
```

## Test API Directly
Open browser to: http://localhost:3000/health
Should return: `{"status":"ok",...}`