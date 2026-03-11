import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./../components/Header";
import { PayPalButton } from "react-paypal-button-v2";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails, payOrder } from "../Redux/Actions/OrderActions";
import Loading from "./../components/LoadingError/Loading";
import Message from "./../components/LoadingError/Error";
import moment from "moment";
import axios from "axios";
import { ORDER_PAY_RESET } from "../Redux/Constants/OrderConstants";
import { toast } from "react-toastify";

const fixEncoding = (str) => {
  if (!str) return str;
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
};

const OrderScreen = ({ match }) => {
  window.scrollTo(0, 0);
  const [sdkReady, setSdkReady] = useState(false);
  const orderId = match.params.id;
  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;
  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;
  const userLogin = useSelector((state) => state.userLogin);

  const calculatedItemsPrice = useMemo(() => {
    if (!order || !order.orderItems) return 0;
    
    const addDecimals = (num) => {
      return Math.round(num * 100) / 100;
    };

    if (order.typePay === "loan") {
      return addDecimals(
        order.orderItems.reduce(
          (acc, item) => acc + (item.loanPrice || 0) * item.qty,
          0
        )
      );
    } else {
      return addDecimals(
        order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
      );
    }
  }, [order]);

  const displayItemsPrice = calculatedItemsPrice || order?.itemsPrice || 0;

  useEffect(() => {
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    
    if (isNaN(numericOrderId)) {
      return;
    }
    
    const currentOrderId = order?.id ? (typeof order.id === 'string' ? parseInt(order.id, 10) : order.id) : null;
    const shouldLoadOrder = !order || !currentOrderId || currentOrderId !== numericOrderId;
    
    if (shouldLoadOrder) {
      dispatch({ type: "ORDER_DETAILS_REQUEST" });
      dispatch(getOrderDetails(numericOrderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    const addPayPalScript = async () => {
      try {
        const { data } = await axios.get("/api/config/paypal");
        const configData = data.data;
        const clientId = configData.clientId;
        
        if (!clientId || clientId === "yourPaypalClientIdHere" || clientId.trim() === "") {
          setSdkReady(true);
          return;
        }
        
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
        script.async = true;
        script.onload = () => {
          setSdkReady(true);
        };
        script.onerror = () => {
          setSdkReady(true);
        };
        document.body.appendChild(script);
      } catch (error) {
        setSdkReady(true);
      }
    };
    
    if (order && order.id) {
      const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
      
      if (order.id === numericOrderId || order.id.toString() === orderId.toString()) {
        if (!order.isPaid) {
          const paymentMethod = (order.paymentMethod || "").toLowerCase();
          if (paymentMethod === "paypal") {
            if (!window.paypal) {
              addPayPalScript();
            } else {
              setSdkReady(true);
            }
          } else {
            setSdkReady(true);
          }
        }
      }
    }
  }, [dispatch, orderId, successPay, order]);

  const successPaymentHandler = (paymentResult) => {
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    
    if (isNaN(numericOrderId)) {
      toast.error("Lỗi: Order ID không hợp lệ. Vui lòng thử lại.");
      return;
    }
    
    dispatch(payOrder(numericOrderId, paymentResult));
  };

  useEffect(() => {
    if (successPay) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId, successPay]);

  const renderPrice = (qty, price, loanPrice, typePay) => {
    let prices = price * qty;

    return prices.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  const showPrice = (price) => {
    return price.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  const handleReceive = async () => {
    try {
      if (!userLogin || !userLogin.userInfo) {
        toast.error("Vui lòng đăng nhập để xác nhận nhận hàng.");
        return;
      }

      const { userInfo } = userLogin;
      
      if (!userInfo || !userInfo.token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const currentOrderId = order?.id || order?._id;
      if (!currentOrderId) {
        toast.error("Không tìm thấy thông tin đơn hàng.");
        return;
      }

      const { data } = await axios.put(
        `/api/orders/${currentOrderId}/delivered`,
        { status: 'dahoanthanh' },
        config
      );
      
      const orderData = data.data;
      
      if (orderData) {
        dispatch(getOrderDetails(currentOrderId));
      } else {
        dispatch(getOrderDetails(currentOrderId));
      }
    } catch (error) {
      
      let errorMessage = "Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.";
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData && errorData.data && errorData.data.message) {
          errorMessage = errorData.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : (
          <>
            <div className="row  order-detail">
              <div className="col-lg-4 col-sm-4 mb-lg-4 mb-5 mb-sm-0">
                <div className="row">
                  <div className="col-md-4 center">
                    <div className="alert-success order-box">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                  <div className="col-md-8 center">
                    <h5>
                      <strong>Khách hàng</strong>
                    </h5>
                    <p>{order.user.name}</p>
                    <p>
                      <a href={`mailto:${order.user.email}`}>
                        {order.user.email}
                      </a>
                    </p>
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
                    <p>Shipping: {order.shippingAddress.country}</p>
                    <p>Trạng thái thanh toán: {order.paymentMethod}</p>
                    {order.isPaid ? (
                      <div className="bg-info p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Đã thanh toán {moment(order.paidAt).calendar()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-danger p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Chưa thanh toán
                        </p>
                      </div>
                    )}
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
                      <strong>Giao hàng đến</strong>
                    </h5>
                    <p>
                      Địa chỉ: {fixEncoding(order.shippingAddress.city)},{" "}
                      {fixEncoding(order.shippingAddress.address)},{" "}
                      {fixEncoding(order.shippingAddress.postalCode)}
                    </p>
                    {order.isDelivered ? (
                      <div className="bg-info p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Đã giao lúc {moment(order.deliveredAt).calendar()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-danger p-2 col-12">
                        <p className="text-white text-center text-sm-start">
                          Chưa giao hàng
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row order-products justify-content-between">
              <div className="col-lg-8">
                {order.orderItems.length === 0 ? (
                  <Message variant="alert-info mt-5">
                    Chưa có đơn đặt hàng
                  </Message>
                ) : (
                  <>
                    {order.orderItems.map((item, index) => (
                      <div className="order-product row" key={index}>
                        <div className="col-md-3 col-6">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="col-md-3 col-6 d-flex align-items-center">
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
                          <h6>{item.price.toLocaleString("it-IT", {
                            style: "currency",
                            currency: "VND",
                          })}</h6>
                        </div>
                        <div className="mt-3 mt-md-0 col-md-2 col-6 align-items-end  d-flex flex-column justify-content-center ">
                          <h4>Tổng tiền đơn hàng</h4>
                          <h6>
                            {item.qty &&
                              renderPrice(
                                item.qty,
                                item.price,
                                item.loanPrice,
                                item.typePay
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
                      <td>{showPrice(displayItemsPrice)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Shipping</strong>
                      </td>
                      <td>{showPrice(order.shippingPrice)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Thuế</strong>
                      </td>
                      <td>{showPrice(order.taxPrice)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Tổng</strong>
                      </td>
                      <td>{showPrice(order.totalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
                {!order.isPaid && (() => {
                  const paymentMethod = (order.paymentMethod || "").toLowerCase();
                  if (paymentMethod === "paypal") {
                    const paypalClientId = order.paymentMethod === "Paypal" ? 
                      (localStorage.getItem("paypalClientId") || "") : "";
                    
                    return (
                      <div className="col-12">
                        {loadingPay && <Loading />}
                        {!sdkReady ? (
                          <Loading />
                        ) : window.paypal ? (
                          <PayPalButton
                            amount={order.totalPrice}
                            onSuccess={successPaymentHandler}
                          />
                        ) : (
                          <div className="bg-warning p-2 text-center">
                            <p className="text-white mb-0">
                              PayPal chưa được cấu hình. Vui lòng liên hệ admin hoặc chọn "Thanh toán khi nhận hàng".
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className="col-12">
                        <div className="bg-warning p-2 text-center">
                          <p className="text-white mb-0">
                            Đơn hàng sẽ được thanh toán khi nhận hàng
                          </p>
                        </div>
                      </div>
                    );
                  }
                })()}
                    {
                      order.isPaid && !order.isDelivered && (
                        <div className="bg-warning p-3 text-center" style={{ cursor: 'pointer', borderRadius: '5px' }} onClick={handleReceive}>
                          <i className="fas fa-check-circle me-2"></i>
                          <strong>Xác nhận đã nhận hàng</strong>
                          <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                            Nhấn vào đây khi bạn đã nhận được hàng
                          </p>
                        </div>
                      )
                    }
                    {
                      order.isPaid && order.isDelivered && (
                        <div className="bg-success p-3 text-center" style={{ borderRadius: '5px' }}>
                          <i className="fas fa-check-double me-2"></i>
                          <strong>Đã nhận hàng</strong>
                          <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                            {order.deliveredAt ? `Ngày nhận: ${moment(order.deliveredAt).format('DD/MM/YYYY HH:mm')}` : ''}
                          </p>
                        </div>
                      )
                    }

                    {
                      order.status === 'dahoanthanh' && (
                        <div className="p-2" style={{ color: 'white', backgroundColor : '#0f5132'}}>
                        Đơn hàng đã nhận thành công
                      </div>
                      )
                    }
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OrderScreen;
