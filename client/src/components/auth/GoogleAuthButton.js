import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuthButton = ({ onSuccess, onError, text = "signin_with" }) => {
  const hasGoogleClient = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  if (!hasGoogleClient) {
    return (
      <div className="google-auth-wrap">
        <div className="google-auth-divider">
          <span>hoac</span>
        </div>
        <button
          type="button"
          className="google-auth-placeholder"
          disabled
        >
          <span className="google-auth-icon">G</span>
          <span>Dang nhap bang Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="google-auth-wrap">
      <div className="google-auth-divider">
        <span>hoac</span>
      </div>
      <div className="google-auth-button">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (onSuccess) {
              onSuccess(credentialResponse);
            }
          }}
          onError={() => {
            if (onError) {
              onError("Dang nhap Google that bai. Vui long thu lai.");
            }
          }}
          text={text}
          theme="outline"
          size="large"
          shape="pill"
          width="320"
          locale="vi"
        />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
