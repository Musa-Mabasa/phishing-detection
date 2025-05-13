export interface EmailResult {
  result: "Legitimate" | "Phishing";
  confidence: number;
}
