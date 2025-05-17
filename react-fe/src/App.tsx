import { useRef, useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";
import type { EmailResult } from "./model";
import { getColorByPercentile } from "./helpers";

function App() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [emailText, setEmailText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState(false);

  const handleFileUpload = () => {
    console.log("File upload button clicked");

    setUploading(true);
    const file = fileRef.current?.files?.[0];
    console.log("File selected:", file);
    if (file) {
      const data = new FormData();
      data.append("file", file);
      fetch("http://localhost:3000/upload-file", {
        method: "POST",
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Network response was not ok");
          }
        })
        .then((data: EmailResult) => {
          console.log("File upload response:", data);
          data.confidence = data.confidence * 100;
          setResult(data);
        })
        .catch((error) => {
          setError(() => {
            setTimeout(() => {
              setError(false);
            }, 5000);
            return true;
          });
          console.error("Error uploading file:", error);
        })
        .finally(() => {
          setUploading(false);
        });
      console.log("File upload request sent");

      return;
    }
    setUploading(false);
  };

  const handleTextUpload = () => {
    console.log("Text upload button clicked");
    setUploading(true);
    fetch("http://localhost:3000/upload-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: emailText }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data: EmailResult) => {
        console.log("Text upload response:", data);
        data.confidence = data.confidence * 100;
        setResult(data);
      })
      .catch((error) => {
        setError(() => {
          setTimeout(() => {
            setError(false);
          }, 5000);
          return true;
        });
        console.error("Error uploading text:", error);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <div className="bg-[url(./assets/background.png)] h-full w-full flex">
      <div className="hidden relative w-full xl:flex flex-col justify-center px-24">
        <img
          src={logo}
          alt="logo"
          className="hidden xl:block w-24 h-24 absolute top-5"
        />
        <div className="flex flex-col ml-auto justify-center items-start text-white gap-10 self-center">
          <div className="">
            <h1>Detect Phishing. </h1>
            <h1>
              Stay <span className="text-accent">Safe.</span>
            </h1>
          </div>
          <p>
            Protect your personal and business accounts with advanced, real-time
            phishing detection and instant alerts that stop cyber threats before
            they reach you.
          </p>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-md w-full h-full xl:rounded-l-2xl overflow-auto">
        <div className="relative flex flex-col justify-start items-start h-full px-24 py-32 gap-6">
          <img
            src={logo}
            alt="logo"
            className="absolute xl:hidden w-24 h-24 top-5"
          />
          {error && (
            <div
              role="alert"
              className="alert alert-error absolute top-10 right-5 animate-bounce"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Error! Failed to detect email.</span>
            </div>
          )}

          <div className="flex flex-col justify-start items-start text-white gap-4 ">
            <h2 className="text-4xl">Upload your email</h2>
            <p>Upload your email file as a .txt file.</p>
          </div>
          <div className="flex flex-col justify-center items-start gap-5">
            <input
              type="file"
              accept=".txt"
              className="file-input"
              ref={fileRef}
            />
            <button
              className="btn btn-accent text-white"
              onClick={handleFileUpload}
              disabled={uploading}
            >
              Upload
            </button>
          </div>
          <div className="flex flex-col justify-start items-start text-white gap-4 ">
            <h2 className="text-4xl">Detect email text</h2>
            <p>Add email text to detect.</p>
          </div>
          <div className="flex flex-col justify-center items-start gap-5 w-full">
            <textarea
              className="textarea textarea-lg w-full h-44"
              placeholder="Email"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
            ></textarea>
            <button
              className="btn btn-accent text-white"
              onClick={handleTextUpload}
              disabled={uploading}
            >
              Detect
            </button>
          </div>
          <div className="flex flex-col justify-center items-center text-white gap-4 w-full h-full">
            {!uploading && result && (
              <>
                {result.result === "Legitimate" ? (
                  <div className="card card-border bg-base-100 w-full border-accent">
                    <div className="card-body">
                      <h2 className="card-title text-accent text-xl">
                        Legitimate
                      </h2>
                      <p className="w-fit text-md">
                        Confidence Score:{" "}
                        {getColorByPercentile(result.confidence) === "green" ? (
                          <span className="text-accent">
                            {result.confidence}
                          </span>
                        ) : getColorByPercentile(result.confidence) ===
                          "yellow" ? (
                          <span className="text-yellow-400">
                            {result.confidence}
                          </span>
                        ) : (
                          <span className="text-red-400">
                            {result.confidence}
                          </span>
                        )}
                        %
                      </p>
                      <p>
                        Reasons for this decision:{" "}
                        {result.reasons
                          .filter(
                            (reason) =>
                              reason.impact.toLowerCase() === "positive"
                          )
                          .map((reason) => reason.explanation.trim())
                          .filter(
                            (explanation, i, self) =>
                              i === self.indexOf(explanation)
                          )
                          .join(". ")}
                        .
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="card card-border bg-base-100 w-full border-red-400">
                    <div className="card-body">
                      <h2 className="card-title text-red-400 text-xl">
                        Phishing
                      </h2>
                      <p className="w-fit text-md">
                        Confidence Score:{" "}
                        {getColorByPercentile(result.confidence) === "green" ? (
                          <span className="text-accent">
                            {result.confidence}%
                          </span>
                        ) : getColorByPercentile(result.confidence) ===
                          "yellow" ? (
                          <span className="text-yellow-400">
                            {result.confidence}%
                          </span>
                        ) : (
                          <span className="text-red-400">
                            {result.confidence}%
                          </span>
                        )}
                      </p>
                      <p>
                        Reasons for this decision:{" "}
                        {result.reasons
                          .filter(
                            (reason) =>
                              reason.impact.toLowerCase() === "positive"
                          )
                          .map((reason) => reason.explanation.trim())
                          .filter(
                            (explanation, i, self) =>
                              i === self.indexOf(explanation)
                          )
                          .join(". ")}
                        .
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            {uploading && (
              <span className="loading loading-dots loading-xl"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
