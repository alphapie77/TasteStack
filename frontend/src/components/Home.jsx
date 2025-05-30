import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container text-center mt-5 pt-5">
      <h1 className="mb-3">Welcome to TasteStack</h1>
      <p>Explore and share the world’s best recipes!</p>
      <div>
        <Link to="/auth" className="btn" style={{ backgroundColor: "#1877F2", color: "#fff", fontWeight: "bold" }}>
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default Home;
