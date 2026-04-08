import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import { saveShippingAddress } from "../Redux/Actions/cartActions";

const ShippingScreen = ({ history }) => {
  window.scrollTo(0, 0);

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "TP. Hồ Chí Minh");
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "700000");
  const [country, setCountry] = useState(shippingAddress.country || "Việt Nam");

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    history.push("/payment");
  };
  return (
    <>
      <Header />
      <div className="container d-flex justify-content-center align-items-center login-center">
        <form
          className="Login col-md-8 col-lg-4 col-11"
          onSubmit={submitHandler}
        >
          <button type="button" className="btn-back" onClick={() => history.push('/cart')}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <h6>Thông tin Giao hàng</h6>
          
          <input
            type="text"
            placeholder="Địa chỉ (Số nhà, Tên đường, Phường/Xã...)"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tỉnh / Thành phố"
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
          />
          
          <div style={{ width: '100%', textAlign: 'left', marginTop: '15px' }}>
            <span style={{color: 'var(--color-text-muted)', fontSize: '12px', display: 'block', marginBottom: '-10px'}}>
              *Gợi ý Mã bưu điện: TP.HCM (700000), Hà Nội (100000). Có thể để mặc định.
            </span>
          </div>
          <input
            type="text"
            placeholder="Mã bưu điện (Zip/Postal Code)"
            value={postalCode}
            required
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Quốc gia"
            value={country}
            required
            readOnly  
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
            onChange={(e) => setCountry(e.target.value)}
          />
          <button type="submit">Tiếp tục thanh toán</button>
        </form>
      </div>
    </>
  );
};

export default ShippingScreen;
