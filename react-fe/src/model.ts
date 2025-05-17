export interface EmailResult {
  result: "Legitimate" | "Phishing";
  confidence: number;
  reasons: Reason[];
}

export interface Reason {
  explanation: string;
  impact: string;
  shap_value: number;
}
