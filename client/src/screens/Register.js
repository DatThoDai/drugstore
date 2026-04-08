import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Message from "../components/LoadingError/Error";
import Loading from "../components/LoadingError/Loading";
import { loginWithGoogle, register } from "../Redux/Actions/userActions";
import Header from "./../components/Header";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const Register = ({ location, history }) => {
  window.scrollTo(0, 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const redirect = location.search ? location.search.split("=")[1] : "/";

  const validatePassword = (pw) => {
    if (pw.length < 8) return "Mật khẩu ít nhất 8 ký tự";
    if (!/[A-Z]/.test(pw)) return "Cần ít nhất 1 chữ hoa (A-Z)";
    if (!/[0-9]/.test(pw)) return "Cần ít nhất 1 chữ số (0-9)";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return "Cần ít nhất 1 ký tự đặc biệt (!@#$...)";
    return "";
  };

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
    if (score <= 2) return { label: "Yếu", color: "#ef4444", width: "33%" };
    if (score <= 3) return { label: "Trung bình", color: "#f59e0b", width: "66%" };
    return { label: "Mạnh", color: "#15803d", width: "100%" };
  };

  const userRegister = useSelector((state) => state.userRegister);
  const { error, loading, userInfo } = userRegister;
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo: userInfoLogin } = userLogin;

  useEffect(() => {
    if (userInfoLogin) {
      history.push(redirect);
    } else if (userInfo) {
      history.push(redirect !== "/" ? `/login?redirect=${redirect}` : "/login");
    }
  }, [userInfo, userInfoLogin, history, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    const err = validatePassword(password);
    if (err) { setPasswordError(err); return; }
    setPasswordError("");
    dispatch(register(name, email, phone, password));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      return;
    }
    dispatch(loginWithGoogle(credentialResponse.credential));
  };

  return (
    <>
      <Header />
      <div className="container d-flex flex-column justify-content-center align-items-center login-center">
        {error && <Message variant="alert-danger">{error}</Message>}
        {loading && <Loading />}

        <form
          className="Login col-md-8 col-lg-4 col-11"
          onSubmit={submitHandler}
        >
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div style={{ position: "relative", marginTop: "12px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              value={password}
              style={{ paddingRight: "44px", marginTop: 0, width: "100%" }}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(validatePassword(e.target.value));
              }}
            />
            <span
              onClick={() => setShowPassword(v => !v)}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#888", fontSize: "16px" }}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </span>
          </div>
          {password && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ height: "5px", borderRadius: "4px", background: "#e5e7eb", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: "4px", width: getStrength(password).width, background: getStrength(password).color, transition: "all 0.3s" }}></div>
              </div>
              <p style={{ fontSize: "12px", color: getStrength(password).color, margin: "4px 0 0", textAlign: "right" }}>
                {getStrength(password).label}
              </p>
            </div>
          )}
          {passwordError && (
            <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}>
              <i className="fas fa-exclamation-circle"></i> {passwordError}
            </p>
          )}

          <button type="submit" style={{ marginTop: "16px" }}>Đăng ký</button>
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            text="signin_with"
          />
          <p>
            <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>
              Tôi đã có tài khoản <strong>Đăng nhập</strong>
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;
