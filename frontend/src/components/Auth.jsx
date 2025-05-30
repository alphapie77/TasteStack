import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
  };

  const linkHoverStyle = {
    textDecoration: "none",
    color: "#001f3f",
    fontWeight: "bold",
    backgroundColor: "transparent",
    padding: "4px 8px",
    borderRadius: "5px",
    transition: "all 0.3s ease"
  };

  const handleMouseOver = (e) => {
    e.target.style.color = "#001f3f";
    e.target.style.backgroundColor = "#e0e0e0";
  };

  const handleMouseOut = (e) => {
    e.target.style.color = "#001f3f";
    e.target.style.backgroundColor = "transparent";
  };

  return (
    <div className="d-flex justify-content-center align-items-start vh-100 bg-light pt-5">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <div className="card p-4 shadow-sm" style={{ backgroundColor: "white" }}>
          <h3 className="text-center mb-3" style={{ color: "#001f3f" }}>
            {isLogin ? "Login" : "Register"}
          </h3>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {!isLogin && (
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            <div className="mb-3 text-center">
              <button
                type="submit"
                className="btn w-100"
                style={{
                  backgroundColor: "#001f3f",
                  color: "white",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#2a5d84";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#001f3f";
                  e.target.style.transform = "scale(1)";
                }}
              >
                {isLogin ? "Login" : "Register"}
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <Link
                  to="#"
                  onClick={() => setIsLogin(false)}
                  style={linkHoverStyle}
                  onMouseOver={handleMouseOver}
                  onMouseOut={handleMouseOut}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  to="#"
                  onClick={() => setIsLogin(true)}
                  style={linkHoverStyle}
                  onMouseOver={handleMouseOver}
                  onMouseOut={handleMouseOut}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
