import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./../components/Header";
import Footer from "./../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails } from "../Redux/Actions/OrderActions";
import Loading from "./../components/LoadingError/Loading";
import Message from "./../components/LoadingError/Error";
import moment from "moment";
import axios from "axios";
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
  const [loadingVNPay, setLoadingVNPay] = useState(false);
  const orderId = match.params.id;
  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;
  const userLogin = useSelector((state) => state.userLogin);

  const calculatedItemsPrice = useMemo(() => {
    if (!order || !order.orderItems) return 0;
    const addDecimals = (num) => Math.round(num * 100) / 100;
    if (order.typePay === "loan") {
      return addDecimals(order.orderItems.reduce((acc, item) => acc + (item.loanPrice || 0) * item.qty, 0));
    } else {
      return addDecimals(order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0));
    }
  }, [order]);

  const displayItemsPrice = calculatedItemsPrice || order?.itemsPrice || 0;

  useEffect(() => {
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    if (isNaN(numericOrderId)) return;
    const currentOrderId = order?.id ? (typeof order.id === 'string' ? parseInt(order.id, 10) : order.id) : null;
    const shouldLoadOrder = !order || !currentOrderId || currentOrderId !== numericOrderId;
    if (shouldLoadOrder) {
      dispatch({ type: "ORDER_DETAILS_REQUEST" });
      dispatch(getOrderDetails(numericOrderId));
    }
  }, [dispatch, orderId]);

  const createVNPayPaymentHandler = async () => {
    try {
      const currentOrderId = order?.id || order?._id;
      if (!currentOrderId) {
        toast.error("Không tìm thấy đơn hàng.");
        return;
      }

      if (!userLogin?.userInfo?.token) {
        toast.error("Vui lòng đăng nhập để thanh toán.");
        return;
      }

      setLoadingVNPay(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userLogin.userInfo.token}`,
        },
      };

      const { data } = await axios.post(`/api/orders/${currentOrderId}/vnpay-url`, {}, config);
      const paymentUrl = data?.data?.paymentUrl;

      if (!paymentUrl) {
        toast.error("Không tạo được URL thanh toán VNPay.");
        setLoadingVNPay(false);
        return;
      }

      window.location.href = paymentUrl;
    } catch (error) {
      const message = error?.response?.data?.message || "Lỗi khởi tạo thanh toán VNPay";
      toast.error(message);
      setLoadingVNPay(false);
    }
  };

  const showPrice = (price) => {
    return price.toLocaleString("it-IT", { style: "currency", currency: "VND" });
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}` },
      };
      const currentOrderId = order?.id || order?._id;
      if (!currentOrderId) {
        toast.error("Không tìm thấy thông tin đơn hàng.");
        return;
      }
      await axios.put(`/api/orders/${currentOrderId}/delivered`, { status: 'dahoanthanh' }, config);
      dispatch(getOrderDetails(currentOrderId));
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.";
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Header />
      <div className="container order-screen">

        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>

        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : (
          <>

            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: "24px", marginBottom: "6px" }}>
                Đơn hàng #{order.id}
              </h2>
              <p style={{ color: "#5F6F6D", fontSize: "14px" }}>
                Đặt ngày {moment(order.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>


            <div className="order-info-cards">

              <div className="order-info-card">
                <div className="card-icon"><i className="fas fa-user"></i></div>
                <h6>Khách hàng</h6>
                <p><strong>{order.user.name}</strong></p>
                <p><a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
              </div>


              <div className="order-info-card">
                <div className="card-icon"><i className="fas fa-credit-card"></i></div>
                <h6>Thanh toán</h6>
                <p>Phương thức: <strong>{order.paymentMethod}</strong></p>
                <p>Vận chuyển: <strong>{order.shippingAddress.country}</strong></p>
                {order.isPaid ? (
                  <div className="order-status-badge paid">
                    <i className="fas fa-check-circle"></i>
                    Đã thanh toán {moment(order.paidAt).format("DD/MM/YYYY")}
                  </div>
                ) : (
                  <div className="order-status-badge unpaid">
                    <i className="fas fa-clock"></i>
                    Chưa thanh toán
                  </div>
                )}
              </div>


              <div className="order-info-card">
                <div className="card-icon"><i className="fas fa-map-marker-alt"></i></div>
                <h6>Giao hàng đến</h6>
                <p>
                  {fixEncoding(order.shippingAddress.address)}, {fixEncoding(order.shippingAddress.postalCode)}, {fixEncoding(order.shippingAddress.city)}
                </p>
                {order.isDelivered ? (
                  <div className="order-status-badge delivered">
                    <i className="fas fa-check-circle"></i>
                    Đã giao {moment(order.deliveredAt).format("DD/MM/YYYY")}
                  </div>
                ) : (
                  <div className="order-status-badge not-delivered">
                    <i className="fas fa-truck"></i>
                    Đang giao hàng
                  </div>
                )}
              </div>
            </div>


            <div className="row">

              <div className="col-lg-8" style={{ marginBottom: "24px" }}>
                <div className="order-items-section">
                  <div className="order-items-header">
                    <h5><i className="fas fa-box" style={{ marginRight: "8px", fontSize: "14px" }}></i>Sản phẩm đặt mua</h5>
                  </div>
                  {order.orderItems.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#5F6F6D" }}>Chưa có sản phẩm</div>
                  ) : (
                    order.orderItems.map((item, index) => (
                      <div className="order-item-row" key={index}>
                        <div className="order-item-img">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="order-item-info">
                          <Link to={`/products/${item.product}`}>
                            <h6>{item.name}</h6>
                          </Link>
                          <p>Đơn giá: {showPrice(item.price)}</p>
                        </div>
                        <div className="order-item-qty">
                          <span>Số lượng</span>
                          <strong>{item.qty}</strong>
                        </div>
                        <div className="order-item-price">
                          <span>Thành tiền</span>
                          <strong>{showPrice(item.price * item.qty)}</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>


              <div className="col-lg-4">
                <div className="order-summary-card">
                  <div className="order-summary-header">
                    <h5><i className="fas fa-receipt" style={{ marginRight: "8px", fontSize: "14px" }}></i>Tổng đơn hàng</h5>
                  </div>
                  <div className="order-summary-row">
                    <span>Sản phẩm</span>
                    <span>{showPrice(displayItemsPrice)}</span>
                  </div>
                  <div className="order-summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{showPrice(order.shippingPrice)}</span>
                  </div>
                  <div className="order-summary-row">
                    <span>Thuế</span>
                    <span>{showPrice(order.taxPrice)}</span>
                  </div>
                  <div className="order-summary-row total">
                    <span>Tổng thanh toán</span>
                    <span>{showPrice(order.totalPrice)}</span>
                  </div>


                  {!order.isPaid && (() => {
                    const paymentMethod = (order.paymentMethod || "").toLowerCase();
                    if (paymentMethod === "vnpay") {
                      return (
                        <div className="order-action">
                          {loadingVNPay && <Loading />}
                          <button className="order-action-btn confirm" onClick={createVNPayPaymentHandler} disabled={loadingVNPay}>
                            <i className="fas fa-wallet"></i>
                            {loadingVNPay ? "Đang chuyển sang VNPay..." : "Thanh toán qua VNPay"}
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="order-action">
                          <div className="order-action-btn warning">
                            <i className="fas fa-money-bill-wave"></i>
                            Thanh toán khi nhận hàng
                          </div>
                        </div>
                      );
                    }
                  })()}


                  {order.isPaid && !order.isDelivered && (
                    <div className="order-action">
                      <button className="order-action-btn confirm" onClick={handleReceive}>
                        <i className="fas fa-check-circle"></i>
                        Xác nhận đã nhận hàng
                      </button>
                    </div>
                  )}


                  {order.isPaid && order.isDelivered && (
                    <div className="order-action">
                      <div className="order-action-btn success">
                        <i className="fas fa-check-double"></i>
                        Đã nhận hàng — {moment(order.deliveredAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                  )}

                  {order.status === 'dahoanthanh' && (
                    <div className="order-action">
                      <div className="order-action-btn success">
                        <i className="fas fa-box-check"></i>
                        Đơn hàng hoàn thành
                      </div>
                    </div>
                  )}
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

export default OrderScreen;
