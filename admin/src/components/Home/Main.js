import React from "react";
import TopTotal from "./TopTotal";
import LatestOrder from "./LatestOrder";
import SaleStatistics from "./SalesStatistics";
import ProductsStatistics from "./ProductsStatistics";
import { useSelector } from "react-redux";
import { CSVLink, CSVDownload } from "react-csv";
import axios from "axios";
import Chart from 'chart.js/auto';
import { useState, useEffect } from "react";
import { Bar } from 'react-chartjs-2';
import { monthNames } from "../../ulities/imageUpload";
import { toast } from "react-toastify";

const Main = () => {
  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;
  const productList = useSelector((state) => state.productList);
  const { products } = productList;
  const lowStockCount = products
    ? products.filter((product) => Number(product.countInStock ?? 0) <= Number(product.lowStockThreshold ?? 10)).length
    : 0;
  const { userInfo } = useSelector((state) => state.userLogin);
  const [data, setData] = useState([]);
  const [res, setRes] = useState({});
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(thisYear, now.getMonth() + 1, 0).getDate();
  const [date, setDate] = useState({
    startDate: `${thisYear}-01-01`,
    endDate: `${thisYear}-${thisMonth}-${lastDay}`
  })

  const handleDownload = async () => {
    const res = await axios.get(`/api/orders/all`);
    if (res.data?.data?.file) {
      const linkSource = res.data.data.file;
      const downloadLink = document.createElement("a");
      const fileName = res.data.data.name;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        };
        const startDefault = `${new Date().getFullYear()}-01-01`;
        const nowD = new Date();
        const endDefault = `${nowD.getFullYear()}-${String(nowD.getMonth()+1).padStart(2,'0')}-${new Date(nowD.getFullYear(), nowD.getMonth()+1, 0).getDate()}`;
        const result = await axios.get(`/api/orders/filter/${startDefault}/${endDefault}`, config);
        setData(result.data?.data ?? result.data ?? []);
      } catch (err) {
        console.warn('Không thể tải dữ liệu thống kê:', err?.response?.status);
      }
    };
  
    fetchData();
  }, [userInfo]);

  const renderChart = () => {
    const labels = data.map((item) => `Tháng ` + (item.id || item._id));
    const counts = data.map((item) => item.count);
    const totalPrice = data.map((item) => item.totalPrice);

    const ress = {
      labels: labels,
      datasets: [
        {
          label: 'Số lượng',
          data: counts,
          fill: true,
          backgroundColor: '#742774',
          borderColor: '#742774',
        },
        {
          label: 'Tổng giá trị',
          data: totalPrice,
          fill: true,
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)'
        },
      ],
    };

    return ress;
  };

  const handleSearch = async() => {
    if (!date.startDate || !date.endDate) {
      toast.error('Vui lòng điền thông tin trước khi lọc');
    } else {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        };
        const result = await axios.get(`/api/orders/filter/${date.startDate}/${date.endDate}`, config);
        setData(result.data?.data ?? result.data ?? []);
      } catch (err) {
        toast.error('Không thể tải dữ liệu: ' + (err?.response?.status === 403 ? 'Không có quyền truy cập' : err.message));
      }
    }
  }

  return (
    <>
      <section className="content-main">
        {/* <CSVLink
          data={orders}
          className="btn btn-success"
          style={{
            float: "right",
          }}
        >
          Xuất File CSV
        </CSVLink> */}
        <div className="content-header">
          <h2 className="content-title"> Dashboard </h2>
        </div>

        <TopTotal orders={orders} products={products} lowStockCount={lowStockCount} />
        <div className="row">
        <div className="col-xl-12 col-lg-12">
      <div className="card mb-4 shadow-sm flex-dashboard">
              <div className="form-input">
                {/* <label htmlFor="">Ngày Bắt Đầu</label> */}
              <input type="date" value={date.startDate} onChange={(e) => setDate({...date, startDate : e.target.value})}/>
              </div>
              <div className="mx-3">~</div>
              <div className="form-input">
              {/* <label htmlFor="">Ngày Kết Thúc</label> */}
              <input type="date" value={date.endDate} onChange={(e) => setDate({...date, endDate : e.target.value})}/>
              </div>
              <div className="form-input">
                <div className="btn btn-primary" onClick={handleSearch}>Lọc</div> 
              </div>
      </div>
    </div>
        </div>
        <div className="row">
        <div className="col-xl-12 col-lg-12">
      <div className="card mb-4 shadow-sm">
        <article className="card-body">
          <h5 className="card-title">Thống kê theo tháng</h5>
          {<Bar data={renderChart()} />}
        </article>
      </div>
    </div>
        </div>
        {/* <div className="row">
    
          <SaleStatistics />
          <ProductsStatistics />
        </div> */}
    
        <div className="card mb-4 shadow-sm">
          <LatestOrder orders={orders} loading={loading} error={error} />
        </div>
      </section>
    </>
  );
};

export default Main;
