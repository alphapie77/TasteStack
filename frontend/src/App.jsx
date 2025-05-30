import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Auth from "./components/Auth";
import About from "./components/About";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
