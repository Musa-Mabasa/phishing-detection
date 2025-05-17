import sys
import json
import pickle
import pandas as pd
import xgboost as xgb
from email.utils import parsedate_to_datetime
from scipy.sparse import hstack, csr_matrix
import shap

# Load pre-fitted vectorizers and scaler
with open("subject_vec.pkl", "rb") as f:
    subject_vec = pickle.load(f)

with open("body_vec.pkl", "rb") as f:
    body_vec = pickle.load(f)

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# Load the model
model = xgb.XGBClassifier(use_label_encoder=False,
    eval_metric='logloss',
    scale_pos_weight=0.79,  # Adjust as needed
    max_depth=4,
    min_child_weight=3,
    gamma=1,
    subsample=0.8,
    colsample_bytree=0.8)

model.load_model("model.bin")

# Read JSON from stdin
data = json.load(sys.stdin)
df = pd.DataFrame([data])

# Extract sender domain
df['sender_domain'] = df['sender'].str.extract(r'@(.+)$')

df['receiver_domain'] = df['receiver'].str.extract(r'@(.+)$')

# Map to frequency used in training (fallback to 0 if new domain)
domain_freq = df['sender_domain'].value_counts(normalize=True).to_dict()
df['sender_domain_freq'] = df['sender_domain'].map(domain_freq)

# Parse date and extract features
df['date'] = pd.to_datetime(df['date'], utc=True, errors='coerce')
df['hour'] = df['date'].dt.hour
df['dayofweek'] = df['date'].dt.dayofweek
df['is_weekend'] = df['dayofweek'] >= 5

# Clean text
df['subject'] = df['subject'].fillna('')
df['body'] = df['body'].fillna('')

# Transform text features using pre-fitted vectorizers
X_subject_new = subject_vec.transform(df['subject'])
X_body_new = body_vec.transform(df['body'])
X_text_new = hstack([X_subject_new, X_body_new])

# Transform numeric features using pre-fitted scaler
X_numeric_new = df[['sender_domain_freq', 'hour', 'dayofweek', 'is_weekend', 'urls']].values
X_numeric_scaled_new = scaler.transform(X_numeric_new)

# Combine text and numeric features
X_input = hstack([X_text_new, csr_matrix(X_numeric_scaled_new)])

# Predict probabilities using the loaded model
y_proba = model.predict_proba(X_input)

# Get the predicted class and its confidence score
y_pred = y_proba.argmax(axis=1)[0]  # Predicted class (0 or 1)
confidence_score = float(y_proba[0][y_pred])  # Confidence score for the predicted class

# --- SHAP values for explanation ---
explainer = shap.Explainer(model)
shap_values = explainer(X_input)

# Get feature names for numeric and text features
numeric_features = ['sender_domain_freq', 'hour', 'dayofweek', 'is_weekend', 'urls']
subject_feature_names = [f"subject_tfidf_{i}" for i in range(X_subject_new.shape[1])]
body_feature_names = [f"body_tfidf_{i}" for i in range(X_body_new.shape[1])]
feature_names = subject_feature_names + body_feature_names + numeric_features

# Create a mapping of feature names to plain English explanations
feature_explanations = {
    "sender_domain_freq": "The sender's domain is indicative of a phishing domain",
    "hour": "The time of day the email was sent",
    "dayofweek": "The day of the week the email was sent",
    "is_weekend": "Whether the email was sent on a weekend",
    "urls": "The number of URLs in the email body",
}

# Add explanations for TF-IDF features
for i in range(X_subject_new.shape[1]):
    feature_explanations[f"subject_tfidf_{i}"] = f"Specific terms in the email's subject"
for i in range(X_body_new.shape[1]):
    feature_explanations[f"body_tfidf_{i}"] = f"Specific terms in the email's body"

# Get SHAP values for the instance
instance_shap_values = shap_values.values[0]
# Get top 5 features by absolute SHAP value
top_indices = abs(instance_shap_values).argsort()[-5:][::-1]
reasons = [
    {
        "feature": feature_names[i],
        "shap_value": float(instance_shap_values[i]),
        "explanation": feature_explanations.get(feature_names[i], "Unknown feature"),
    }
    for i in top_indices
]

# Create a JSON object with the result, confidence score, and reasons
result = {
    "result": "Phishing" if y_pred == 1 else "Legitimate",
    "confidence": round(confidence_score, 2),
    "reasons": [
        {
            "explanation": reason["explanation"],
            "impact": f"{'Positive' if reason['shap_value'] > 0 else 'Negative'}",
            "shap_value": reason["shap_value"],
        }
        for reason in reasons
    ],
}

# Print the JSON object
print(json.dumps(result, indent=2))