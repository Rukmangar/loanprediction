"""Train and persist the LoanPredict classification pipeline."""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "loan_prediction.csv"
MODEL_PATH = BASE_DIR / "loan_model.pkl"

FEATURES = [
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
CATEGORICAL_FEATURES = [
    "Gender",
    "Married",
    "Dependents",
    "Education",
    "Self_Employed",
    "Property_Area",
]
NUMERIC_FEATURES = [feature for feature in FEATURES if feature not in CATEGORICAL_FEATURES]


def build_model() -> Pipeline:
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    numeric_pipeline = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="median"))]
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
        ]
    )
    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=250,
                    max_depth=9,
                    min_samples_leaf=3,
                    random_state=42,
                    class_weight="balanced",
                ),
            ),
        ]
    )


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    dataset = pd.read_csv(DATA_PATH)
    missing_columns = sorted(set(FEATURES + ["Loan_Status"]) - set(dataset.columns))
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing_columns)}")

    features = dataset[FEATURES].copy()
    target = dataset["Loan_Status"].astype(str).str.upper()
    for column in NUMERIC_FEATURES:
        features[column] = pd.to_numeric(features[column], errors="coerce")

    model = build_model()
    model.fit(features, target)
    artifact = {
        "model": model,
        "features": FEATURES,
        "version": "loanpredict-random-forest-v1",
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"Trained {len(dataset):,} records and saved {MODEL_PATH}")


if __name__ == "__main__":
    main()
