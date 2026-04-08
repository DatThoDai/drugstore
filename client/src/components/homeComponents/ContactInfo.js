import React from "react";

const ContactInfo = () => {
  return (
    <div className="contactInfo">
      <div className="container">
        <div className="section-heading">
          <h2>Liên hệ với chúng tôi</h2>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi</p>
          <div className="line"></div>
        </div>
        <div className="row">
          <div className="col-12 col-md-4 contact-Box">
            <div className="box-info">
              <div className="info-image">
                <i className="fab fa-facebook-f"></i>
              </div>
              <h5>Facebook</h5>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <p>DrugStore Official</p>
              </a>
            </div>
          </div>
          <div className="col-12 col-md-4 contact-Box">
            <div className="box-info">
              <div className="info-image">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h5>Địa chỉ</h5>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.google.com/maps/search/173+Ph%E1%BA%A1m+Ng%C5%A9+L%C3%A3o"
              >
                <p>173 Phạm Ngũ Lão, Q.1, TP.HCM</p>
              </a>
            </div>
          </div>
          <div className="col-12 col-md-4 contact-Box">
            <div className="box-info">
              <div className="info-image">
                <i className="fas fa-phone-alt"></i>
              </div>
              <h5>Hotline</h5>
              <a href="tel:0123206636">
                <p>0123 206 636</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
