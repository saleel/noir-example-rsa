import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GenerateKeys from './pages/generate-keys';
import SignData from './pages/sign-data';
import Prove from './pages/prove';
import VerifyProof from './pages/verify-proof';
import VerifySignature from './pages/verify-signature';

function App() {
  return (
    <Router>
      <div>
        <nav className="nav-menu">
          <Link to="/">Generate Keys</Link>
          <Link to="/sign">Sign Data</Link>
          <Link to="/verify-signature">Verify Signature</Link>
          <Link to="/prove">Prove</Link>
          <Link to="/verify">Verify</Link>
        </nav>

        <Routes>
          <Route path="/" element={<GenerateKeys />} />
          <Route path="/sign" element={<SignData />} />
          <Route path="/verify-signature" element={<VerifySignature />} />
          <Route path="/prove" element={<Prove />} />
          <Route path="/verify" element={<VerifyProof />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 