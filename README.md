# Running Instructions

## 1. Create Environment Files

### Backend `.env` file
Create a `.env` file inside the **backend** directory:

```env
OPENAI_KEY=YOURKEYHERE
GEMINI_KEY=YOURKEYHERE
```

---

### Frontend `.env` file
Create a `.env` file inside the **frontend** directory:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

---

## 2. Download Dependencies & Run Servers

---

### Backend Setup

Open a new terminal, navigate to the **backend** directory, and run the following commands  
(make sure Python is installed):

#### macOS / Linux
```bash
python3 -m pip install -r requirements.txt
python3 -m uvicorn server:app --reload
```

#### Windows
```bash
python -m pip install -r requirements.txt
python -m uvicorn server:app --reload
```

The backend will run at:
```
http://127.0.0.1:8000
```

---

### Frontend Setup

Open a new terminal, navigate to the **frontend** directory, and run:

```bash
npm install
npm start
```

The frontend will run at:
```
http://localhost:3000
```

---

## 3. Configure the AI Endpoint (Required)

Open the following file:

```
frontend/src/pages/Main.tsx
```

Locate **lines 123 & 178**, where the `fetch` request is made.

### If you are using **OpenAI**
Ensure the endpoint is set to:

```ts
const response = await fetch(`${API_URL}/openaiAPItest`, {
```

### If you are using **Gemini**
Change the endpoint to:

```ts
const response = await fetch(`${API_URL}/geminitest`, {
```

Save the file after making the change.

⚠️ **Only one endpoint should be used at a time**, depending on which API key you have configured in your backend `.env` file.

---

## Notes
- Restart the frontend (`npm start`) after changing the endpoint.
- Make sure the corresponding API key (`OPENAI_KEY` or `GEMINI_KEY`) is set in the backend `.env` file.
