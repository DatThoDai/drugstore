import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createOrder } from "../Redux/Actions/OrderActions";
import { ORDER_CREATE_RESET } from "../Redux/Constants/OrderConstants";
import Header from "./../components/Header";
import Message from "./../components/LoadingError/Error";

const PlaceOrderScreen = ({ history }) => {
  window.scrollTo(0, 0);

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userLogin = useSelector((state) => state.userLogin);

  const { userInfo } = userLogin;
  const typePay = localStorage.getItem("typePay");
  const payRaw = localStorage.getItem("paymentMethod");
  const pay = payRaw ? JSON.parse(payRaw) : "VNPay";

  const addDecimals = (num) => {
    return Math.round(num * 100) / 100;
  };

  const calculatePrices = useMemo(() => {
    if (!cart.cartItems || cart.cartItems.length === 0) {
      return {
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
        itemsLoanPrice: 0,
        shippingLoanPrice: 0,
        taxLoanPrice: 0,
        totalLoanPrice: 0,
      };
    }

    if (typePay === "buy") {
      const itemsPrice = addDecimals(
        cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
      );
      const shippingPrice = addDecimals(itemsPrice > 500000 ? 0 : 30000);
      const taxPrice = addDecimals(Number(0.05 * itemsPrice));
      const totalPrice = Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice);
      
      return {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        itemsLoanPrice: 0,
        shippingLoanPrice: 0,
        taxLoanPrice: 0,
        totalLoanPrice: 0,
      };
    } else if (typePay === "loan") {
      const itemsLoanPrice = addDecimals(
        cart.cartItems.reduce((acc, item) => acc + (item.loanPrice || 0) * item.qty, 0)
      );
      const shippingLoanPrice = addDecimals(itemsLoanPrice > 100 ? 0 : 100);
      const taxLoanPrice = addDecimals(Number(0.05 * itemsLoanPrice));
      const totalLoanPrice = Number(itemsLoanPrice) + Number(shippingLoanPrice) + Number(taxLoanPrice);
      
      return {
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
        itemsLoanPrice,
        shippingLoanPrice,
        taxLoanPrice,
        totalLoanPrice,
      };
    }
    
    return {
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 0,
      itemsLoanPrice: 0,
      shippingLoanPrice: 0,
      taxLoanPrice: 0,
      totalLoanPrice: 0,
    };
  }, [cart.cartItems, typePay]);

  const prices = calculatePrices;

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error } = orderCreate;

  useEffect(() => {
    if (success && order) {
      const orderId = order.id || order._id;
      if (orderId) {
        dispatch({ type: ORDER_CREATE_RESET });
        history.push(`/order/${orderId}`);
      }
    }
  }, [history, dispatch, success, order]);

  let carts = JSON.parse(localStorage.getItem("cartItems"));

  const placeOrderHandler = (type) => {
    const transformedOrderItems = cart.cartItems.map(item => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      loanPrice: item.loanPrice || 0,
      product: typeof item.product === 'string' ? parseInt(item.product) : item.product,
    }));

    if (type === "loan") {
      dispatch(
        createOrder({
          orderItems: transformedOrderItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: pay === "Credit" ? "Credit" : "VNPay",
          itemsPrice: prices.itemsLoanPrice,
          shippingPrice: prices.shippingLoanPrice,
          taxPrice: prices.taxLoanPrice,
          totalPrice: prices.totalLoanPrice,
          isPaid: (pay && pay.toLowerCase() === "credit") ? true : false, 
          typePay: "loan",
        })
      );
    } else {
      dispatch(
        createOrder({
          orderItems: transformedOrderItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: pay === "Credit" ? "Credit" : "VNPay",
          itemsPrice: prices.itemsPrice,
          shippingPrice: prices.shippingPrice,
          taxPrice: prices.taxPrice,
          totalPrice: prices.totalPrice,
          isPaid: (pay && pay.toLowerCase() === "credit") ? true : false, 
          typePay: "buy",
        })
      );
    }
  };

  const renderPrice = (qty, price, loanPrice, typePay) => {
    let prices = "";
    if (typePay === "buy") {
      prices = price * qty;
    } else {
      prices = loanPrice * qty;
    }
    return prices?.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  const showPrice = (price) => {
    return price?.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <>
      <Header />
      <div className="container">
        <button className="btn-back" onClick={() => setShowLeaveModal(true)}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <div className="row order-detail-cards mt-4">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="checkout-info-card">
              <div className="icon-wrapper">
                <i className="fas fa-user"></i>
              </div>
              <div className="info-content">
                <h5>Thông tin khách hàng</h5>
                <p><strong>{userInfo.name}</strong></p>
                <p>{userInfo.email}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="checkout-info-card">
              <div className="icon-wrapper">
                <i className="fas fa-truck"></i>
              </div>
              <div className="info-content">
                <h5>Thanh toán & Vận chuyển</h5>
                <p>Quốc gia: {cart.shippingAddress.country}</p>
                <p>Thanh toán: {(pay || cart.paymentMethod) === "Credit" ? "Trực tiếp (COD)" : "VNPay"}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="checkout-info-card">
              <div className="icon-wrapper">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="info-content">
                <h5>Địa chỉ nhận hàng</h5>
                <p>{cart.shippingAddress.address}</p>
                <p>{cart.shippingAddress.city}<br/>Mã bưu điện: {cart.shippingAddress.postalCode}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-2 mb-5">
          <div className="col-lg-8">
            {cart.cartItems.length === 0 ? (
              <Message variant="alert-info mt-5">
                Chưa có sản phẩm nào trong giỏ hàng
              </Message>
            ) : (
              <div className="checkout-products-list">
                {cart.cartItems.map((item, index) => (
                  <div className="checkout-product-row" key={index}>
                    <img src={item.image} alt={item.name} />
                    <div className="product-details">
                      <Link to={`/products/${item.product}`}>
                        <h6>{item.name}</h6>
                      </Link>
                      <div className="price-calc">
                        <span>{showPrice(item.price)}</span>
                        <span className="qty">× {item.qty}</span>
                      </div>
                    </div>
                    <div className="product-total">
                      <h6>
                        {item.qty && renderPrice(item.qty, item.price, item.loanPrice, typePay)}
                      </h6>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className="checkout-summary-card">
              <h4>Tổng kết đơn hàng</h4>
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{showPrice(typePay === "buy" ? prices.itemsPrice : prices.itemsLoanPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{showPrice(typePay === "buy" ? prices.shippingPrice : prices.shippingLoanPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Thuế (5%)</span>
                <span>{showPrice(typePay === "buy" ? prices.taxPrice : prices.taxLoanPrice)}</span>
              </div>
              <hr />
              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span className="total-price">{showPrice(typePay === "buy" ? prices.totalPrice : prices.totalLoanPrice)}</span>
              </div>
              {cart.cartItems.length > 0 && (
                <button type="submit" className="btn-place-order" onClick={() => placeOrderHandler(typePay)}>
                  XÁC NHẬN ĐẶT HÀNG
                </button>
              )}
              {error && (
                <div className="mt-3">
                  <Message variant="alert-danger">{error}</Message>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLeaveModal && (
        <div className="custom-modal-overlay show">
          <div className="custom-modal-content">
            <div className="modal-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Khoan đã!</h4>
            <p>Đơn hàng của bạn chưa được hoàn tất. Bạn có chắc chắn muốn quay lại và hủy tiến trình thanh toán không?</p>
            <div className="modal-actions">
              <button className="btn-cancel-modal" onClick={() => setShowLeaveModal(false)}>
                Tiếp tục thanh toán
              </button>
              <button className="btn-confirm-modal" onClick={() => history.push('/cart')}>
                Đồng ý rời đi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceOrderScreen;
