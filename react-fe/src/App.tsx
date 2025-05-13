import "./App.css";
import logo from "./assets/logo.png";

function App() {
  return (
    <div className="bg-[url(./assets/background.png)] h-full w-full flex">
      <div className="hidden relative w-full xl:flex flex-col justify-center px-24">
        <img src={logo} alt="logo" className="w-24 h-24 absolute top-5" />
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
      <div className="bg-white/5 backdrop-blur-md w-full h-full rounded-l-4xl overflow-auto">
        <div className="flex flex-col justify-start items-start h-full px-24 py-16 gap-6">
          <div className="flex flex-col justify-start items-start text-white gap-4 ">
            <h2 className="text-4xl">Upload your email</h2>
            <p>Upload your email file as a .txt file.</p>
          </div>
          <div className="flex flex-col justify-center items-start gap-5">
            <input type="file" accept=".txt" className="file-input" />
            <button className="btn btn-accent text-white">Upload</button>
          </div>
          <div className="flex flex-col justify-start items-start text-white gap-4 ">
            <h2 className="text-4xl">Detect email text</h2>
            <p>Add email text to detect.</p>
          </div>
          <div className="flex flex-col justify-center items-start gap-5 w-full">
            <textarea
              className="textarea textarea-lg w-full h-44"
              placeholder="Email"
            ></textarea>
            <button className="btn btn-accent text-white">Detect</button>
          </div>
          <div className="card card-border bg-base-100 w-96 border-accent">
            <div className="card-body">
              <h2 className="card-title text-accent text-xl">Card Title</h2>
              <p className="w-fit text-md">Confidence Score: 90%</p>
              <p>
                This is a legitamate email. It does not contain any phishing
                links or malicious content. You are safe to open this email.
              </p>
            </div>
          </div>
          <div className="card card-border bg-base-100 w-96 border-red-400">
            <div className="card-body">
              <h2 className="card-title text-red-400 text-xl">Phishing</h2>
              <p className="w-fit text-md">Confidence Score: 90%</p>
              <p>
                This is a phishing email. It contains malicious links or
                content. Do not open this email. Report it to your email
                provider or IT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
