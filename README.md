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
