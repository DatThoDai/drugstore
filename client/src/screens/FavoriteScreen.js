import React, { useEffect, useState } from "react";
import Header from "./../components/Header";
import Footer from "./../components/Footer";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "./../Redux/Actions/cartActions";

const FavoriteScreen = ({ history }) => {
  const dispatch = useDispatch();
  window.scrollTo(0, 0);
  const [listStore, setListStore] = useState(JSON.parse(localStorage.getItem("favorite")) || []);

  const addAllToCartHandler = () => {
    listStore.forEach((item) => {
      dispatch(addToCart(item.id, item.quantity || 1, "buy"));
    });
    // Don't optionally clear favorites unless intended, but the old code cleared it. Let's keep it if they want it.
    // localStorage.setItem("favorite", JSON.stringify([])); 
    // better UX: Just add to cart, don't delete favorites!
    history.push("/cart");
  };

  const removeFromCartHandle = (id) => {
    const listFavorite = JSON.parse(localStorage.getItem("favorite")) || [];
    const list = listFavorite.filter((item) => item.id !== id);
    setListStore(list);
    localStorage.setItem("favorite", JSON.stringify(list));
    window.dispatchEvent(new Event("favoritesUpdated"));
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
          <h2 style={{ display: "inline-block", marginRight: "12px" }}>
            <i className="fas fa-heart" style={{ color: "var(--color-danger)", marginRight: "8px" }}></i>
            Sản phẩm yêu thích
          </h2>
          {listStore?.length > 0 && <span className="badge2" style={{ display: "inline-flex" }}>{listStore.length}</span>}
        </div>

        {listStore?.length === 0 || !listStore ? (
          <div className="alert alert-info" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)", borderRadius: "var(--radius-lg)", padding: "40px 20px", textAlign: "center" }}>
            <p style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Chưa có sản phẩm nào trong danh sách yêu thích.</p>
            <Link className="round-black-btn" to="/" style={{ display: "inline-flex", width: "auto", padding: "0 32px", alignItems: "center" }}>
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              {listStore.map((item) => (
                <div className="cart-iterm row" key={item.id}>
                  <div
                    onClick={() => removeFromCartHandle(item.id)}
                    className="remove-button"
                    title="Bỏ yêu thích"
                  >
                    <i className="fas fa-times"></i>
                  </div>
                  <div className="cart-image col-md-3">
                    <img src={item.img} alt={item.name} />
                  </div>
                  <div className="cart-text col-md-5 d-flex align-items-center">
                    <Link to={`/products/${item.id}`}>
                      <h4>{item.name}</h4>
                    </Link>
                  </div>
                  <div className="cart-price mt-3 mt-md-0 col-md-4 d-flex align-items-center justify-content-end">
                    <div style={{ textAlign: "right" }}>
                      <h4 style={{ fontSize: "18px", color: "var(--color-cta)", marginBottom: "12px" }}>{showPrice(item.price)}</h4>
                      <button 
                        className="order-action-btn confirm" 
                        style={{ padding: "8px 16px", fontSize: "12px", width: "auto", display: "inline-block" }}
                        onClick={() => {
                          dispatch(addToCart(item.id, 1, "buy"));
                          history.push("/cart");
                        }}
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4">
              <div className="order-summary-card" style={{ top: "40px" }}>
                <div className="order-summary-header">
                  <h5><i className="fas fa-heartbeat" style={{ marginRight: "8px", fontSize: "14px" }}></i>Danh sách ({listStore.length})</h5>
                </div>
                <div className="order-action" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button className="order-action-btn confirm" onClick={addAllToCartHandler}>
                    Thêm tất cả vào giỏ <i className="fas fa-cart-plus"></i>
                  </button>
                  <Link to="/" className="order-action-btn" style={{ background: "var(--color-surface)", color: "var(--color-text)", fontWeight: "600", textDecoration: "none" }}>
                    Tiếp tục khám phá
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default FavoriteScreen;
