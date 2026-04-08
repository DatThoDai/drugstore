import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../../Redux/Actions/ProductActions";
import Loading from "../LoadingError/Loading";
import Message from "../LoadingError/Error";
import axios from "axios";
import { toast } from "react-toastify";

const URL = process.env.REACT_APP_SERVER_URL;

const MainPrescription = () => {
  const [keyword, setKeyword] = useState();
  const [isSearch, setIsSearch] = useState(0);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  let history = useHistory();

  const [order, setOrder] = useState([]);
  const [productList, setProductList] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPayment, setIsPayment] = useState(false);

  const productDelete = useSelector((state) => state.productDelete);
  const { error: errorDelete, success: successDelete } = productDelete;

  const total = order.reduce((a, i) => a + i.qty * i.price, 0);

  useEffect(async () => {
    setIsLoading(true);
      const data = await axios.get(`${URL}/api/products/all-prescription`);
      if (data) {
        setProductList(data.data)
        setIsLoading(false);
      }
  }, []);

  useEffect(async () => {
    if (email) {
      setIsLoading(true);
      const data = await axios.get(`${URL}/api/users/get-only-email/${email}`);
      if (data) {
        if (data?.data?.name) {
          setName(data?.data?.name);
          
        } else {
          setName('Không tìm thấy');
        }
        setIsLoading(false);
      }
    }
  }, [email]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const data = await axios.get(`${URL}/api/products/search-prescription/${keyword}`);
      if (data.status === 200) {
        setIsSearch(1);
        setData(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const showPrice = (price) => {
    return price.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  const handleAddOrder = (item) => {
    let obj = {
      product: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      countInStock: item.countInStock,
      loanPrice: item.loanPrice,
      typePay: "buy",
      qty: 1,
    };

    let check = order.find((e) => e.product === item._id);

    if (check) {
      let op = order.filter((e) => e.product != item._id);

      const newI = {
        ...obj,
        qty: check.qty + 1,
      };

      const newArr = [...op, newI];
      setOrder(newArr);
    } else {
      const newArr = [...order, obj];

      setOrder(newArr);
    }
  };

  const handleRemove = (id) => {
    let op = order.filter((e) => e.product != id);
    setOrder(op);
  };

  const handleChangeNumber = (e, id) => {
    let check = order.find((e) => e.product === id);
    check.qty = e.target.value;

    let op = order.filter((e) => e.product != id);

    const newArr = [...op, check];

    setOrder(newArr);
  };

  const handleTypingEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePrescription = async() => {
    const request = {
      orderItems : order,
      shippingAddress: {
        address: 'Đặt tại quán',
        city: 'Sản phẩm được mua tại chỗ',
        postalCode: 'QCODE-200',
        country: 'VN'
    },
    paymentMethod: 'Tại quán',
    taxPrice : 0,
    shippingPrice: 0,
    totalPrice : total,
    typePay: 'buy',
      emailUser: email,
      status: 'dahoanthanh',
      paymentResult: {
        status: 'COMPLETED',
        update_time: Date.now()
      },
      isPaid: true,
      isDelivered: true,
      deliveredAt: Date.now(),
      nameUser : name
    }

    setIsPayment(true);
    const res = await axios.post(`${URL}/api/orders/prescription-order`, request);

    if (res.status === 201) {
      setName('');
      setEmail('');
      setOrder([]);
      setIsPayment(false)
      toast.success('Kê đơn thành công');
    }
  }

  const handleReloadPage = async() => {
    window.location.reload();
  }

  return (
    <>
    {
      isPayment?(
        <Loading/>
      ) : (
        <section className="content-main">
      <div className="content-header">
        <h2 className="content-title">Danh sách sản phẩm</h2>
      </div>

      <div className="card mb-4 shadow-sm">
        <header className="card-header bg-white ">
          <div className="row gx-3 py-3">
            <div className="col-lg-4 col-md-6 me-auto d-flex gap-2">
              <form onSubmit={submitHandler} className="input-group">
                <input
                  type="search"
                  placeholder="Search..."
                  className="form-control p-2"
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </form>
              <div className="btn btn-primary" onClick={() => handleReloadPage()}>Reload</div>
            </div>
            <div className="col-lg-2 col-6 col-md-3"></div>
            <div className="col-lg-2 col-6 col-md-3"></div>
          </div>
        </header>

        <div className="card-body">
          {errorDelete && (
            <Message variant="alert-danger">{errorDelete}</Message>
          )}
          {isLoading ? (
            <Loading />
          ) : (
            <div className="row">
              {isSearch == 0
                ? productList?.map((item) => (
                    <div
                      key={item._id}
                      className="col-md-6 col-sm-6 col-lg-3 mb-5"
                    >
                      <div className="card card-product-grid shadow-sm">
                        <Link to="#" className="img-wrap">
                          <img src={item.image} alt="Product" />
                        </Link>
                        <div className="info-wrap">
                          <Link to="#" className="title text-truncate">
                            {item.name} - {item.ma}
                          </Link>
                          <div className="price mb-2 font-weight-bold">
                            {showPrice(item.price)}
                          </div>
                          <div className="row">
                            <div
                              onClick={() => handleAddOrder(item)}
                              className="btn btn-sm btn-outline-success p-2 pb-3 col-md-6 w-100"
                            >
                              <i class="fas fa-plus"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : data?.map((item) => (
                    <div
                      key={item._id}
                      className="col-md-6 col-sm-6 col-lg-3 mb-5"
                    >
                      <div className="card card-product-grid shadow-sm">
                        <Link to="#" className="img-wrap">
                          <img src={item.image} alt="Product" />
                        </Link>
                        <div className="info-wrap">
                          <Link to="#" className="title text-truncate">
                            {item.name} - {item.ma}
                          </Link>
                          <div className="price mb-2 font-weight-bold">
                            {showPrice(item.price)}
                          </div>
                          <div className="row">
                            <Link
                              onClick={() => handleAddOrder(item)}
                              className="btn btn-sm btn-outline-success p-2 pb-3 col-md-6 w-100"
                            >
                              <i class="fas fa-plus"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>

      <div className="content-header">
        <h2 className="content-title">Đơn được kê</h2>
      </div>

      <div className="card card-product-grid mb-4 shadow-sm">
        <div className="d-flex flex-wrap">
          {order?.map((item) => (
            <div key={item.product} className="item-order">
              <img src={item.image} alt="" />
              <div className="info-order">
                <div
                  className="remove-item cursor-pointer"
                  onClick={() => handleRemove(item.product)}
                >
                  <i class="fas fa-minus" style={{ color: "red" }}></i>
                </div>
                <h6>{item.name}</h6>
                <div className="text-bold">SL :</div>{" "}
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  className="item-quantity"
                  onChange={(e) => handleChangeNumber(e, item.product)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="total-price">
          <div className="info-user">
            <div className="mb-4">
              {isLoading ? (
                <Loading />
              ) : (
                <>
                  <label htmlFor="product_title" className="form-label">
                    Tên Người Dùng
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    className="form-control"
                    id="product_title"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    required
                  />
                </>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="product_title" className="form-label">
                Sdt người đăng ký
              </label>
              <input
                type="number"
                placeholder="Type here"
                className="form-control"
                id="product_title"
                required
                value={email}
                onChange={(e) => handleTypingEmail(e)}
              />
            </div>
          </div>
          <div className="right-i">
            <div className="d-flex">
              <p className="total-name">Tổng tiền</p>{" "}
              <span className="price">{showPrice(total)}</span>
            </div>
            {total > 0 ? (
              <div className="btn btn-primary btn-width" onClick={() => handlePrescription()}>Kê đơn</div>
            ) : (
                <>
                </>
            )}
          </div>
        </div>
      </div>
    </section>
      )
    }
    </>
  );
};

export default MainPrescription;
