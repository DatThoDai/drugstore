import React from "react";

const TopTotal = (props) => {
  const { orders, products, lowStockCount } = props;
  let totalSale = 0;
  if (orders) {
    orders.map((order) =>
      order.isPaid === true ? (totalSale = totalSale + order.totalPrice) : null
    );
  }

  const showPrice = (price) => {
    return price.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  const totalOrders = orders ? orders.length : 0;
  const totalProducts = products ? products.length : 0;
  const paidOrders = orders ? orders.filter((o) => o.isPaid).length : 0;

  return (
    <div className="row g-3 mb-4">
      {/* Revenue */}
      <div className="col-lg-4 col-md-6">
        <div className="stat-card stat-card-green">
          <div className="stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-label">Doanh thu</div>
          <div className="stat-value">{showPrice(totalSale)}</div>
        </div>
      </div>

      {/* Orders */}
      <div className="col-lg-4 col-md-6">
        <div className="stat-card stat-card-teal">
          <div className="stat-icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-label">Đơn hàng</div>
          <div className="stat-value">{totalOrders}</div>
          <div style={{ fontSize: "0.78rem", marginTop: "6px", opacity: 0.8 }}>
            {paidOrders} đã thanh toán
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="col-lg-4 col-md-6">
        <div className="stat-card stat-card-amber">
          <div className="stat-icon">
            <i className="fas fa-capsules"></i>
          </div>
          <div className="stat-label">Sản phẩm</div>
          <div className="stat-value">{totalProducts}</div>
          <div style={{ fontSize: "0.78rem", marginTop: "6px", opacity: 0.8 }}>
            {lowStockCount || 0} sắp hết hàng
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTotal;

