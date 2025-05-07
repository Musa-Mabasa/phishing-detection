import sys
import json
import pickle
import pandas as pd
import xgboost as xgb
from email.utils import parsedate_to_datetime
from scipy.sparse import hstack, csr_matrix

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

# Create a JSON object with the result and confidence score
result = {
    "result": "Phishing" if y_pred == 1 else "Legitimate",
    "confidence": round(confidence_score, 2)  # Round to 2 decimal places
}

# Print the JSON object
print(json.dumps(result))