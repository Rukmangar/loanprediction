# LoanPredict

LoanPredict is a machine-learning loan eligibility application with a React frontend and Flask prediction API.

The application collects applicant and loan details, sends them to a trained classification model, and displays the predicted eligibility result with confidence information.

## Features

- React and Vite frontend
- Flask REST API backend
- Synthetic loan prediction dataset
- Random Forest classification model
- Applicant and loan detail form
- Account sign-in and registration interface
- Authentication-gated prediction page
- Loan eligibility confidence output
- CORS support for frontend-to-backend requests

## Project Structure

```text
loanprediction/
├── app.py                    # Flask API application
├── train_model.py            # Trains and saves the model
├── loan_prediction.csv       # Loan training dataset
├── loan_model.pkl            # Generated trained model artifact
├── requirements.txt          # Python dependencies
├── package.json              # Frontend dependencies and scripts
├── package-lock.json
├── index.html                # Vite HTML entry point
├── src/
│   ├── main.jsx              # React application
│   └── styles.css            # Frontend styles
├── templates/                # Optional Flask templates
├── static/                   # Optional Flask static assets
└── notebooks/
    └── loan_analysis.ipynb  # Exploratory analysis notebook
```

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer
- npm

## Backend Setup

Open PowerShell in the project directory:

```powershell
cd D:\Documents\projects\loanprediction
```

Install Python dependencies:

```powershell
python -m pip install -r requirements.txt
```

Train the model:

```powershell
python train_model.py
```

This creates:

```text
loan_model.pkl
```

Build the React frontend and start Flask:

```powershell
npm install
npm run build
python app.py
```

Flask serves the built React website and API at:

```text
http://127.0.0.1:5000
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

Prediction endpoint:

```text
POST http://127.0.0.1:5000/api/predict
```

## Frontend Development Setup

Open a second PowerShell window:

```powershell
cd D:\Documents\projects\loanprediction
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:5173
```

For local frontend development, run Vite and Flask at the same time. The production build is served directly by Flask.

## Render Deployment

Deploy the repository as one Render Web Service:

```text
Build Command: npm install && npm run build && pip install -r requirements.txt && python train_model.py
Start Command: gunicorn --bind 0.0.0.0:$PORT app:app
```

After deployment, open the Render service URL. It serves the updated React interface and the `/api/predict` backend from the same service.

## Prediction Request

The frontend sends JSON similar to:

```json
{
  "Gender": "Male",
  "Married": "Yes",
  "Dependents": "0",
  "Education": "Graduate",
  "Self_Employed": "No",
  "ApplicantIncome": 50000,
  "CoapplicantIncome": 15000,
  "LoanAmount": 1500000,
  "Loan_Amount_Term": 360,
  "Credit_History": 1,
  "Property_Area": "Urban"
}
```

Example response:

```json
{
  "status": "success",
  "prediction": "Likely Approved",
  "decision": "Y",
  "confidence": 0.84,
  "explanation": "The model found a favorable combination of credit history, income, and requested loan parameters."
}
```

## Dataset Columns

```text
Loan_ID
Gender
Married
Dependents
Education
Self_Employed
ApplicantIncome
CoapplicantIncome
LoanAmount
Loan_Amount_Term
Credit_History
Property_Area
Loan_Status
```

Income and loan amounts in the frontend are entered in Indian rupees (₹).

## GitHub

Initialize and push the project:

```powershell
git init
git branch -M main
git add .
git commit -m "Initial LoanPredict application"
git remote add origin https://github.com/YOUR_USERNAME/loanprediction.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

The generated `loan_model.pkl` is excluded by `.gitignore`. Run `python train_model.py` after cloning the repository to recreate it.

## Disclaimer

This project is intended for academic, educational, and portfolio use. Its predictions are model estimates and do not represent a guaranteed financial approval, certified underwriting decision, or lending commitment.
