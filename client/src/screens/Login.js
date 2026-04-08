import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Message from "../components/LoadingError/Error";
import Loading from "../components/LoadingError/Loading";
import Header from "./../components/Header";
import { login, loginWithGoogle } from "./../Redux/Actions/userActions";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const Login = ({ location, history }) => {
  window.scrollTo(0, 0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const redirect = location.search ? location.search.split("=")[1] : "/";

  const userLogin = useSelector((state) => state.userLogin);
  const { error, loading, userInfo } = userLogin;

  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
    }
  }, [userInfo, history, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Đăng nhập ngay</button>
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            text="signin_with"
          />
          <p>
            <Link
              to={redirect ? `/register?redirect=${redirect}` : "/register"}
            >
              Tạo tài khoản mới
            </Link>
          </p>
          <p style={{ marginTop: "4px" }}>
            <Link to="/forgot-password" style={{ color: "#6b7280", fontSize: "13px" }}>
              Quên mật khẩu?
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
