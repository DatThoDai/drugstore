import React, { useEffect } from "react";
import Header from "./../components/Header";
import Footer from "./../components/Footer";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removefromcart, updateCartQty } from "./../Redux/Actions/cartActions";

const CartScreen = ({ match, location, history }) => {
  window.scrollTo(0, 0);
  const dispatch = useDispatch();
  const productId = match.params.id;
  const qty = location.search ? Number(location.search.split("=")[1]) : 1;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const total = cartItems.reduce((a, i) => a + i.qty * i.price, 0);

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty, "buy"));
    }
  }, [dispatch, productId, qty]);

  const checkOutHandler = () => {
    history.push("/login?redirect=shipping");
  };

  const removeFromCartHandle = (id) => {
    dispatch(removefromcart(id));
  };

  const showPrice = (price) => {
    return price.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingBottom: "60px", paddingTop: "20px", minHeight: "calc(100vh - 140px)" }}>
        <button className="btn-back" onClick={() => window.history.back()} style={{ marginBottom: "20px" }}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>

        <div className="section-heading" style={{ marginBottom: "32px", textAlign: "left" }}>
          <h2 style={{ display: "inline-block", marginRight: "12px" }}>Giỏ hàng của bạn</h2>
          {cartItems.length > 0 && <span className="badge2" style={{ display: "inline-flex" }}>{cartItems.length}</span>}
        </div>

        {cartItems.length === 0 ? (
          <div className="alert alert-info" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)", borderRadius: "var(--radius-lg)", padding: "40px 20px", textAlign: "center" }}>
            <p style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link className="round-black-btn" to="/" style={{ display: "inline-flex", width: "auto", padding: "0 32px", alignItems: "center" }}>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-lg-8">
                {cartItems.map((item) => (
                  <div className="cart-iterm row" key={item.product}>
                    <div
                      onClick={() => removeFromCartHandle(item.product)}
                      className="remove-button"
                      title="Xoá sản phẩm"
                    >
                      <i className="fas fa-times"></i>
                    </div>
                    <div className="cart-image col-md-3">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-text col-md-4 d-flex align-items-center">
                      <Link to={`/products/${item.product}`}>
                        <h4>{item.name}</h4>
                      </Link>
                    </div>
                    <div className="cart-qty col-md-3 mt-3 mt-md-0 d-flex flex-column justify-content-center">
                      <h6>Số lượng</h6>
                      <div className="qty-control">
                        <button
                          type="button"
                          className="qty-btn"
                          disabled={item.qty <= 1}
                          onClick={() => dispatch(updateCartQty(item.product, item.qty - 1))}
                        >−</button>
                        <input
                          type="number"
                          className="qty-input"
                          value={item.qty}
                          min={1}
                          max={item.countInStock}
                          onChange={(e) => {
                            const v = Math.max(1, Math.min(item.countInStock, Number(e.target.value) || 1));
                            dispatch(updateCartQty(item.product, v));
                          }}
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          disabled={item.qty >= item.countInStock}
                          onClick={() => dispatch(updateCartQty(item.product, item.qty + 1))}
                        >+</button>
                      </div>
                    </div>
                    <div className="cart-price mt-3 mt-md-0 col-md-2 d-flex flex-column justify-content-center">
                      <h6>Thành tiền</h6>
                      <h4>{showPrice(item.price * item.qty)}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-lg-4">
                <div className="order-summary-card" style={{ top: "40px" }}>
                  <div className="order-summary-header">
                    <h5><i className="fas fa-receipt" style={{ marginRight: "8px", fontSize: "14px" }}></i>Tóm tắt đơn hàng</h5>
                  </div>
                  <div className="order-summary-row total">
                    <span>Tổng phụ</span>
                    <span>{showPrice(total)}</span>
                  </div>
                  <div className="order-action" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button className="order-action-btn confirm" onClick={checkOutHandler}>
                      Thanh toán ngay <i className="fas fa-arrow-right"></i>
                    </button>
                    <Link to="/" className="order-action-btn" style={{ background: "var(--color-surface)", color: "var(--color-text)", fontWeight: "600", textDecoration: "none" }}>
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartScreen;
