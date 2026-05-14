import './App.css';
import ClientProfile from './Authentication/Components/ClientProfile/ClientProfile';
import LoginSingUp from './Authentication/Components/LoginSignUp/LoginSignUp';
import Main from './components/Main';
import InfluencerSelection from './components/InfluencerSelection';
import DataDeletion from './Other/DataDeletion';
import PrivacyPolicy from './Other/PrivacyPolicy';
import { HashRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/influencer-selection" element={<InfluencerSelection />} />
          <Route path="/login" element={<LoginSingUp />} />
          <Route path="/profile" element={<ClientProfile />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
