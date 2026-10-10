"""Flask API for the LoanPredict React frontend."""

from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "loan_model.pkl"
REQUIRED_FIELDS = [
    "Gender",
    "Married",
    "Dependents",
    "Education",
    "Self_Employed",
    "ApplicantIncome",
    "CoapplicantIncome",
    "LoanAmount",
    "Loan_Amount_Term",
    "Credit_History",
    "Property_Area",
]
NUMERIC_FIELDS = {
    "ApplicantIncome",
    "CoapplicantIncome",
    "LoanAmount",
    "Loan_Amount_Term",
    "Credit_History",
}
MIN_LOAN_AMOUNT = 50_000

DIST_DIR = BASE_DIR / "dist"

app = Flask(__name__)
CORS(app)


@app.get("/")
def index():
    return send_from_directory(DIST_DIR, "index.html")


@app.get("/<path:path>")
def frontend(path):
    requested_file = DIST_DIR / path
    if requested_file.is_file():
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


def load_artifact():
    if not MODEL_PATH.exists():
        raise FileNotFoundError("loan_model.pkl is missing. Run train_model.py first.")
    return joblib.load(MODEL_PATH)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "LoanPredict API"})


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"status": "error", "message": "Request body must be a JSON object."}), 400

    missing_fields = [field for field in REQUIRED_FIELDS if payload.get(field) in (None, "")]
    if missing_fields:
        return jsonify(
            {"status": "error", "message": "Missing required fields.", "fields": missing_fields}
        ), 400

    row = {field: payload[field] for field in REQUIRED_FIELDS}
    try:
        for field in NUMERIC_FIELDS:
            row[field] = float(row[field])
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Numeric fields contain invalid values."}), 400
    if row["LoanAmount"] < MIN_LOAN_AMOUNT:
        return jsonify(
            {
                "status": "error",
                "message": f"Loan amount must be at least ₹{MIN_LOAN_AMOUNT:,}.",
            }
        ), 400

    try:
        artifact = load_artifact()
        model = artifact["model"]
        frame = pd.DataFrame([row], columns=artifact["features"])
        prediction = str(model.predict(frame)[0])
        probabilities = model.predict_proba(frame)[0]
        classes = list(model.classes_)
        confidence = float(probabilities[classes.index(prediction)])
    except FileNotFoundError as error:
        return jsonify({"status": "error", "message": str(error)}), 500
    except (KeyError, ValueError, TypeError) as error:
        return jsonify({"status": "error", "message": f"Prediction failed: {error}"}), 500

    approved = prediction == "Y"
    return jsonify(
        {
            "status": "success",
            "prediction": "Likely Approved" if approved else "Likely Rejected",
            "decision": prediction,
            "confidence": round(confidence, 4),
            "explanation": (
                "The model found a favorable combination of credit history, income, "
                "and requested loan parameters."
                if approved
                else "The model identified elevated risk in the submitted application profile."
            ),
            "metadata": {"model_version": artifact.get("version", "unknown")},
        }
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
