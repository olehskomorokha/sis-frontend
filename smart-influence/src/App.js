import './App.css';
import LoginSingUp from './Authentication/Components/LoginSignUp/LoginSignUp';
import Main from './components/Main';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<LoginSingUp />} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
