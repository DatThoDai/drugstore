import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createOrder } from "../Redux/Actions/OrderActions";
import { ORDER_CREATE_RESET } from "../Redux/Constants/OrderConstants";
import Header from "./../components/Header";
import Message from "./../components/LoadingError/Error";

const PlaceOrderScreen = ({ history }) => {
  window.scrollTo(0, 0);

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userLogin = useSelector((state) => state.userLogin);

  const { userInfo } = userLogin;
  const typePay = localStorage.getItem("typePay");
  const payRaw = localStorage.getItem("paymentMethod");
  const pay = payRaw ? JSON.parse(payRaw) : "Paypal";

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
          paymentMethod: pay === "Credit" ? "Credit" : "Paypal",
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
          paymentMethod: pay === "Credit" ? "Credit" : "Paypal",
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
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <div className="row  order-detail">
          <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
            <div className="row ">
              <div className="col-md-4 center">
                <div className="alert-success order-box">
                  <i class="fas fa-user"></i>
                </div>
              </div>
              <div className="col-md-8 center">
                <h5>
                  <strong>Khách hàng</strong>
                </h5>
                <p>{userInfo.name}</p>
                <p>{userInfo.email}</p>
              </div>
            </div>
          </div>
          {/* 2 */}
          <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
            <div className="row">
              <div className="col-md-4 center">
                <div className="alert-success order-box">
                  <i className="fas fa-truck-moving"></i>
                </div>
              </div>
              <div className="col-md-8 center">
                <h5>
                  <strong>Thông tin đơn hàng</strong>
                </h5>
                <p>Shipping: {cart.shippingAddress.country}</p>
                <p>
                  Hình thức thanh toán:{" "}
                  {(pay || cart.paymentMethod) === "Credit"
                    ? "Thanh toán khi nhận hàng"
                    : "Paypal hoặc thẻ tín dụng / thẻ ghi nợ"}
                </p>
              </div>
            </div>
          </div>
          {/* 3 */}
          <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
            <div className="row">
              <div className="col-md-4 center">
                <div className="alert-success order-box">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
              </div>
              <div className="col-md-8 center">
                <h5>
                  <strong>Deliver to</strong>
                </h5>
                <p>
                  Địa chỉ nhận hàng: {cart.shippingAddress.city},{" "}
                  {cart.shippingAddress.address},{" "}
                  {cart.shippingAddress.postalCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row order-products justify-content-between">
          <div className="col-lg-8">
            {cart.cartItems.length === 0 ? (
              <Message variant="alert-info mt-5">
                Chưa có sản phẩm nào trong giỏ hàng
              </Message>
            ) : (
              <>
                {cart.cartItems.map((item, index) => (
                  <div className="order-product row" key={index}>
                    <div className="col-md-3 col-6">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="col-md-5 col-6 d-flex align-items-center">
                      <Link to={`/products/${item.product}`}>
                        <h6>{item.name}</h6>
                      </Link>
                    </div>
                    <div className="mt-3 mt-md-0 col-md-2 col-6  d-flex align-items-center flex-column justify-content-center ">
                      <h4>Số lượng</h4>
                      <h6>{item.qty}</h6>
                    </div>
                    <div className="mt-3 mt-md-0 col-md-2 col-6  d-flex align-items-center flex-column justify-content-center ">
                      <h4>Thành tiền</h4>
                      <h6>{showPrice(item.price)}</h6>
                    </div>
                    <div className="mt-3 mt-md-0 col-md-2 col-6 align-items-end  d-flex flex-column justify-content-center ">
                      <h4>Tổng</h4>
                      <h6>
                        {item.qty &&
                          renderPrice(
                            item.qty,
                            item.price,
                            item.loanPrice,
                            typePay
                          )}
                      </h6>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          {/* total */}
          <div className="col-lg-3 d-flex align-items-end flex-column mt-5 subtotal-order">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td>
                    <strong>Sản phẩm</strong>
                  </td>
                  <td>{showPrice(typePay === "buy" ? prices.itemsPrice : prices.itemsLoanPrice)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Shipping</strong>
                  </td>
                  <td>{showPrice(typePay === "buy" ? prices.shippingPrice : prices.shippingLoanPrice)} </td>
                </tr>
                <tr>
                  <td>
                    <strong>Thuế</strong>
                  </td>
                  <td>{showPrice(typePay === "buy" ? prices.taxPrice : prices.taxLoanPrice)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tổng</strong>
                  </td>
                  <td>{showPrice(typePay === "buy" ? prices.totalPrice : prices.totalLoanPrice)}</td>
                </tr>
              </tbody>
            </table>
            {cart.cartItems.length === 0 ? null : (
              <button type="submit" onClick={() => placeOrderHandler(typePay)}>
                ĐẶT HÀNG TẬN NƠI
              </button>
            )}
            {error && (
              <div className="my-3 col-12">
                <Message variant="alert-danger">{error}</Message>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderScreen;
