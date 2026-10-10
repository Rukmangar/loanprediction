import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const fields = [
  ['Gender', 'Gender', 'select', ['Male', 'Female']],
  ['Marital status', 'Married', 'select', ['Yes', 'No']],
  ['Dependents', 'Dependents', 'select', ['0', '1', '2', '3+']],
  ['Education', 'Education', 'select', ['Graduate', 'Not Graduate']],
  ['Employment type', 'Self_Employed', 'select', ['No', 'Yes']],
  ['Property area', 'Property_Area', 'select', ['Urban', 'Semiurban', 'Rural']],
  ['Applicant income (₹)', 'ApplicantIncome', 'number', ''],
  ['Co-applicant income (₹)', 'CoapplicantIncome', 'number', ''],
  ['Loan amount (₹)', 'LoanAmount', 'number', ''],
  ['Loan term (months)', 'Loan_Amount_Term', 'select', ['120', '180', '240', '360', '480']],
  ['Credit history', 'Credit_History', 'select', ['1', '0']]
];

function App() {
  const validPages = ['home', 'features', 'how', 'prediction', 'about'];
  const initialPage = window.location.hash.slice(1);
  const [page, setPage] = useState(validPages.includes(initialPage) ? initialPage : 'home');
  const [values, setValues] = useState({});
  const [message, setMessage] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const navigate = (nextPage) => {
    if (!validPages.includes(nextPage)) return;
    setPage(nextPage);
    window.history.pushState({}, '', `#${nextPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleBackForward = () => {
      const nextPage = window.location.hash.slice(1);
      setPage(validPages.includes(nextPage) ? nextPage : 'home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handleBackForward);
    return () => window.removeEventListener('popstate', handleBackForward);
  }, []);

  async function predict(event) {
    event.preventDefault();
    if (!loggedIn) {
      setMessage('Please sign in or create an account before requesting a loan prediction.');
      setPredictionResult(null);
      setLoginOpen(true);
      return;
    }
    const missing = fields.find((field) => !values[field[1]]);
    if (missing) { setMessage(`Please complete ${missing[0]}.`); setPredictionResult(null); return; }
    setLoading(true); setMessage(''); setPredictionResult(null);
    const payload = { ...values };
    ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History'].forEach((key) => { payload[key] = Number(payload[key]); });
    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Prediction request failed.');
      setPredictionResult({ prediction: result.prediction, confidence: Math.round(result.confidence * 100), explanation: result.explanation });
    } catch (error) {
      setMessage(`Prediction failed: ${error.message}`); setPredictionResult(null);
    } finally { setLoading(false); }
  }

  return <div className="app">
    <header><button className="brand" onClick={() => navigate('home')}><b>LP</b> Loan<span>Predict</span></button><nav>{[['home', 'Home'], ['features', 'Features'], ['how', 'How It Works'], ['prediction', 'Loan Prediction'], ['about', 'About Model']].map(([id, label]) => <button className={page === id ? 'active' : ''} onClick={() => navigate(id)} key={id}>{label}</button>)}</nav><div className="header-actions"><button className="login-trigger" onClick={() => { setLoginOpen(true); setAuthMessage(''); }}>{loggedIn ? 'Account' : 'Sign in'}</button><button className="nav-cta" onClick={() => navigate('prediction')}>Check Eligibility</button></div></header>
    {page === 'home' && <section className="hero page"><div><small>● Machine Learning Evaluation Interface</small><h1>Make Smarter <em>Loan Decisions</em> With Confidence</h1><p>Experience an intelligent credit evaluation workflow. Enter personal, income, and loan parameters to assess application risk profiles structured for Decision Tree and ensemble classifiers.</p><button className="primary" onClick={() => navigate('prediction')}>Check Loan Eligibility →</button></div><div className="telemetry"><b>◷ ML PIPELINE TELEMETRY</b><i>REST READY</i><div className="metrics"><span>Model Architecture<strong>Decision Tree / RF</strong></span><span>Feature Vector<strong>11 Features</strong></span></div><pre>{`// Sample JSON Payload for /api/predict
{ "ApplicantIncome": 5400, "Credit_History": 1.0 }`}</pre></div></section>}
    {page === 'features' && <Content title="Built for Precision and Clarity" tag="KEY CAPABILITIES"><div className="cards">{['Simple Application', 'Data-Driven Insights', 'Quick Results'].map((title) => <article key={title}><h3>{title}</h3><p>Clear sections, smart defaults, data validation, and production-ready feedback make the loan evaluation workflow reliable and easy to understand.</p></article>)}</div></Content>}
    {page === 'how' && <Content title="How The Evaluation Works" tag="EVALUATION PIPELINE"><div className="cards four">{['Provide Credentials', 'Validation & Packaging', 'ML Inference', 'Transparent Outcome'].map((title, index) => <article key={title}><b>{index + 1}</b><h3>{title}</h3><p>Each stage prepares, validates, evaluates, and explains the model result.</p></article>)}</div></Content>}
    {page === 'prediction' && <Content title="Loan Eligibility Prediction Form" tag="INTERACTIVE EVALUATION">{!loggedIn ? <div className="auth-required"><h3>Please sign in or create an account</h3><p>You need an account to submit application details and view a loan prediction.</p><button className="primary" onClick={() => { setAuthMode('login'); setLoginOpen(true); setAuthMessage(''); }}>Sign in / Create account →</button></div> : <form className="loan-form" onSubmit={predict}><h3>Applicant &amp; Loan Parameters</h3><div className="field-grid">{fields.map(([label, name, type, options]) => <label key={name}>{label}{type === 'number' ? <input type="number" min="0" placeholder={name === 'LoanAmount' ? '1500000' : '50000'} value={values[name] || ''} onChange={(event) => setValues({ ...values, [name]: event.target.value })} /> : <select value={values[name] || ''} onChange={(event) => setValues({ ...values, [name]: event.target.value })}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>}</label>)}</div><div className="form-actions"><button type="reset" onClick={() => { setValues({}); setMessage(''); setPredictionResult(null); }}>Reset Form</button><button className="primary" disabled={loading}>{loading ? 'Evaluating...' : 'Predict Loan Status →'}</button></div>{predictionResult ? <PredictionResult result={predictionResult} /> : message && <div className="result">{message}</div>}</form>}</Content>}
    {page === 'about' && <Content title="Machine Learning Backend Contract" tag="INTEGRATION ARCHITECTURE"><div className="contract"><pre>{`POST /api/predict
{
  "ApplicantIncome": 5400,
  "LoanAmount": 140,
  "Credit_History": 1.0,
  "Property_Area": "Urban"
}`}</pre><pre>{`{
  "status": "success",
  "prediction": "Likely Approved",
  "confidence": 0.84
}`}</pre></div></Content>}
    {loginOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoginOpen(false); }}><section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="modal-close" onClick={() => setLoginOpen(false)} aria-label="Close">×</button><div className="login-mark">LP</div><small>{authMode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</small><h2 id="login-title">{authMode === 'login' ? 'Sign in to LoanPredict' : 'Create your account'}</h2><p>{authMode === 'login' ? 'Access your saved applications and prediction history.' : 'Save applications and prediction history in one place.'}</p><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get('password') || ''); const confirmation = String(form.get('confirmation') || ''); if (!form.get('email') || !password || (authMode === 'signup' && (!form.get('name') || password !== confirmation))) { setAuthMessage(authMode === 'signup' && password !== confirmation ? 'Passwords do not match.' : 'Complete all required fields.'); return; } setLoggedIn(true); setLoginOpen(false); setAuthMessage(''); }}><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>{authMode === 'signup' && <label>Full name<input name="name" placeholder="Your full name" required /></label>}<label>Password<input name="password" type="password" placeholder="Enter your password" required /></label>{authMode === 'signup' && <label>Confirm password<input name="confirmation" type="password" placeholder="Re-enter your password" required /></label>}{authMessage && <div className="auth-error">{authMessage}</div>}<button className="login-submit" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} →</button></form><p className="auth-switch">{authMode === 'login' ? 'New to LoanPredict?' : 'Already have an account?'} <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage(''); }}>{authMode === 'login' ? 'Create an account' : 'Sign in'}</button></p></section></div>}
  </div>;
}

function Content({ tag, title, children }) { return <section className="content page"><small>{tag}</small><h2>{title}</h2><p>Explore the LoanPredict machine learning evaluation platform.</p>{children}</section>; }

function PredictionResult({ result }) {
  const isApproved = result.prediction.toLowerCase().includes('approved');
  return <div className={`prediction-result ${isApproved ? 'approved' : 'review'}`}>
    <div className="prediction-summary">
      <div><small>MODEL ELIGIBILITY RESULT</small><h3>{result.prediction}</h3><p>{result.explanation}</p></div>
      <div className="confidence-score"><strong>{result.confidence}%</strong><span>eligibility confidence</span></div>
    </div>
    <div className="eligibility-guide"><h4>How to improve your eligibility percentage</h4><div className="guide-grid"><p><b>Improve credit history</b><br />Pay EMIs and credit card balances on time.</p><p><b>Lower debt burden</b><br />Reduce existing monthly obligations before applying.</p><p><b>Choose a suitable amount</b><br />Request a loan that matches your verified income.</p><p><b>Provide accurate details</b><br />Use complete, consistent income and employment information.</p></div><small>This percentage is an educational model estimate, not a guaranteed lending decision.</small></div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
