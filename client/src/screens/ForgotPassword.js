import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Message from "../components/LoadingError/Error";
import Loading from "../components/LoadingError/Loading";
import { forgotPassword, resetPassword } from "../Redux/Actions/userActions";
import { FORGOT_PASSWORD_RESET, RESET_PASSWORD_RESET } from "../Redux/Constants/UserContants";

const ForgotPassword = ({ history }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const { loading: loadingOtp, success: successOtp, error: errorOtp } =
    useSelector((s) => s.forgotPassword) || {};
  const { loading: loadingReset, success: successReset, error: errorReset } =
    useSelector((s) => s.resetPassword) || {};

  useEffect(() => {
    if (successOtp) {
      setStep(2);
      dispatch({ type: FORGOT_PASSWORD_RESET });
    }
  }, [successOtp, dispatch]);

  useEffect(() => {
    if (successReset) {
      dispatch({ type: RESET_PASSWORD_RESET });
      history.push("/login");
    }
  }, [successReset, dispatch, history]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    setLocalError("");
    if (!email.trim()) { setLocalError("Vui lòng nhập email."); return; }
    dispatch(forgotPassword(email.trim().toLowerCase()));
  };

  const handleReset = (e) => {
    e.preventDefault();
    setLocalError("");
    if (!otp.trim()) { setLocalError("Vui lòng nhập mã OTP."); return; }
    if (newPassword.length < 6) { setLocalError("Mật khẩu tối thiểu 6 ký tự."); return; }
    if (newPassword !== confirmPassword) { setLocalError("Mật khẩu xác nhận không khớp."); return; }
    dispatch(resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword));
  };

  return (
    <>
      <Header />
      <div className="container d-flex flex-column justify-content-center align-items-center login-center">
        {(loadingOtp || loadingReset) && <Loading />}
        {(localError || errorOtp || errorReset) && (
          <Message variant="alert-danger">{localError || errorOtp || errorReset}</Message>
        )}

        <form
          className="Login col-md-8 col-lg-4 col-11"
          onSubmit={step === 1 ? handleSendOtp : handleReset}
        >
          <h5
            style={{
              textAlign: "center",
              marginBottom: "16px",
              color: "#15803d",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            {step === 1 ? "🔐 Quên mật khẩu" : "✅ Xác nhận OTP"}
          </h5>

          {step === 1 ? (
            <>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px", textAlign: "center" }}>
                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP về email đó.
              </p>
              <input
                type="email"
                placeholder="Email đã đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loadingOtp}>
                {loadingOtp ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px", textAlign: "center" }}>
                Mã OTP đã được gửi đến <b>{email}</b>.<br />
                Mã có hiệu lực trong <b>5 phút</b>.
              </p>
              <input
                type="text"
                placeholder="Nhập mã OTP (6 chữ số)"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{ letterSpacing: "6px", textAlign: "center", fontSize: "20px" }}
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ marginTop: "10px" }}
                required
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loadingReset}>
                {loadingReset ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </button>
              <p style={{ textAlign: "center", marginTop: "8px" }}>
                <span
                  style={{ color: "#15803d", cursor: "pointer", fontSize: "13px" }}
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    dispatch({ type: FORGOT_PASSWORD_RESET });
                  }}
                >
                  ← Gửi lại OTP
                </span>
              </p>
            </>
          )}

          <p style={{ textAlign: "center", marginTop: "8px" }}>
            <Link to="/login" style={{ color: "#6b7280", fontSize: "13px" }}>
              Quay về đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;
