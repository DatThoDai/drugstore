import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Product from "./Product";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../../Redux/Actions/ProductActions";
import Loading from "../LoadingError/Loading";
import Message from "../LoadingError/Error";
import axios from "axios";
import { URL } from "../../Redux/Url";

const MainProducts = () => {
  const [keyword, setKeyword] = useState();
  const [isSearch, setIsSearch] = useState(0);
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const dispatch = useDispatch();
  let history = useHistory();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const productDelete = useSelector((state) => state.productDelete);
  const { error: errorDelete, success: successDelete } = productDelete;

  const thresholdNumber = Number(threshold || 0);
  const lowStockProducts = (products || []).filter(
    (product) => Number(product.countInStock ?? 0) <= thresholdNumber
  );

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch, successDelete]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const data = await axios.get(`${URL}/api/products/search/${keyword}`);
      if (data.status === 200) {
        setIsSearch(1);
        setData(data.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeOption = async (e) => {
    try {
      if (e.target.value === "all") {
        setIsSearch(0);
        setData([]);
        dispatch(listProducts());
        return;
      }

      if (e.target.value === "low-stock") {
        const response = await axios.get(
          `${URL}/api/products/low-stock?threshold=${thresholdNumber}`
        );
        if (response.status === 200) {
          setIsSearch(1);
          setData(response.data.data);
        }
        return;
      }

      const data = await axios.get(
        `${URL}/api/products/searchProduct/${e.target.value}`
      );
      if (data.status === 200) {
        setIsSearch(1);
        setData(data.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const showLowStock = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/products/low-stock?threshold=${thresholdNumber}`
      );
      if (response.status === 200) {
        setIsSearch(1);
        setData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="content-main">
      <div className="content-header">
        <h2 className="content-title">Danh sách sản phẩm</h2>
        <div>
          <Link to="/addproduct" className="btn btn-primary">
            Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <header className="card-header bg-white ">
          <div className="row gx-3 py-3">
            <div className="col-lg-4 col-md-6 me-auto ">
              <form onSubmit={submitHandler} className="input-group">
                <input
                  type="search"
                  placeholder="Search..."
                  className="form-control p-2"
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </form>
            </div>
            <div className="col-lg-2 col-6 col-md-3"></div>
            <div className="col-lg-2 col-6 col-md-3">
              <input
                type="number"
                min="0"
                className="form-control"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="Ngưỡng"
              />
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <select
                className="form-select"
                onChange={(e) => handleChangeOption(e)}
              >
                <option value="all">Tất cả</option>
                <option value="old">Thêm mới nhất</option>
                <option value="new">Thêm cũ nhất</option>
                <option value="low-stock">Sắp hết hàng</option>
              </select>
            </div>
          </div>
          <div className="row gx-3 pb-2">
            <div className="col-12">
              {lowStockProducts.length > 0 ? (
                <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0 py-2">
                  <span>
                    Có {lowStockProducts.length} sản phẩm sắp hết hàng (ngưỡng {thresholdNumber})
                  </span>
                  <button className="btn btn-sm btn-danger" onClick={showLowStock}>
                    Xem ngay
                  </button>
                </div>
              ) : (
                <div className="alert alert-success mb-0 py-2">
                  Không có sản phẩm sắp hết hàng với ngưỡng {thresholdNumber}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="card-body">
          {errorDelete && (
            <Message variant="alert-danger">{errorDelete}</Message>
          )}
          {loading ? (
            <Loading />
          ) : error ? (
            <Message variant="alert-danger">{error}</Message>
          ) : (
            <div className="row">
              {isSearch == 0
                ? products.map((product) => (
                    <Product product={product} key={product.id} />
                  ))
                : data.map((product) => (
                    <Product product={product} key={product.id} />
                  ))}
            </div>
          )}

          <nav className="float-end mt-4" aria-label="Page navigation">
            <ul className="pagination">
              <li className="page-item disabled">
                <Link className="page-link" to="#">
                  Previous
                </Link>
              </li>
              <li className="page-item active">
                <Link className="page-link" to="#">
                  1
                </Link>
              </li>
              <li className="page-item">
                <Link className="page-link" to="#">
                  2
                </Link>
              </li>
              <li className="page-item">
                <Link className="page-link" to="#">
                  3
                </Link>
              </li>
              <li className="page-item">
                <Link className="page-link" to="#">
                  Next
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default MainProducts;
