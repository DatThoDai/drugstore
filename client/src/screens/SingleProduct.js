import React, { useEffect, useState } from "react";
import Header from "./../components/Header";
import Rating from "../components/homeComponents/Rating";
import { Link } from "react-router-dom";
import Message from "./../components/LoadingError/Error";
import { useDispatch, useSelector } from "react-redux";
import {
  createProductReview,
  listProductDetails,
} from "../Redux/Actions/ProductActions";
import { addToCart, removefromcart } from "./../Redux/Actions/cartActions";
import Loading from "../components/LoadingError/Loading";
import { PRODUCT_CREATE_REVIEW_RESET } from "../Redux/Constants/ProductConstants";
import moment from "moment";
import { toast } from "react-toastify";

const CATEGORY = "6448dce26d5176c1e67a4cb6";

const SingleProduct = ({ history, match }) => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [listStore, setListStore] = useState(JSON.parse(localStorage.getItem('favorite')) || []);
  const productId = match.params.id;
  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const {
    loading: loadingCreateReview,
    error: errorCreateReview,
    success: successCreateReview,
  } = productReviewCreate;

  useEffect(() => {
    if (successCreateReview) {
      toast.success("Đã gửi đánh giá thành công!");
      setRating(0);
      setComment("");
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }
    dispatch(listProductDetails(productId));
  }, [dispatch, productId, successCreateReview]);

  console.log(productDetails);

  const AddToCartHandle = (e) => {
    e.preventDefault();

    console.log(productDetails.category);

    if (productDetails?.product?.category == CATEGORY) {
      toast.error('Sản Phẩm này thuộc vào phần kê đơn');
      return;
    }
    dispatch(addToCart(productId, qty, 'buy'));
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const BuyNowHandle = (e) => {
    e.preventDefault();
    if (productDetails?.product?.category == CATEGORY) {
      toast.error('Sản Phẩm này thuộc vào phần kê đơn');
      return;
    }
    dispatch(addToCart(productId, qty, 'buy'));
    history.push('/cart');
  };

  const AddToFavoriteHandle = () => {
    const stored = JSON.parse(localStorage.getItem('favorite')) || [];
    const obj = {
      id: product.id,
      name: product.name,
      img: product.image,
      price: product.price,
      quantity: 1
    };

    const exists = stored.find(item => item.id === product.id);
    let updated;
    if (exists) {
      updated = stored.filter(item => item.id !== product.id);
      toast.info('Đã xoá khỏi danh sách yêu thích');
    } else {
      updated = [...stored, obj];
      toast.success('Đã thêm vào danh sách yêu thích');
    }
    localStorage.setItem('favorite', JSON.stringify(updated));
    setListStore(updated);
    window.dispatchEvent(new Event('favoritesUpdated'));
  }

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProductReview(productId, {
        rating,
        comment,
      })
    );
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
      <div className="container single-product">
        <button className="btn-back" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        {loading ? (
          <Loading />
        ) : error ? (
          <Message variant="alert-danger">{error}</Message>
        ) : (
          <>
            <div className="row g-4 justify-content-center align-items-start">
              <div className="col-md-6">
                <div className="single-image">
                  <img src={product.image} alt={product.name} />
                  <i className={`fas fa-heart heart ${listStore.find(item => item.id == product.id) ? 'bg-red' : ''}`} onClick={AddToFavoriteHandle}></i>
                </div>
              </div>
              <div className="col-md-6">
                <div className="product-dtl">
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                  </div>
                  <p>{product.description}</p>

                  <div className="product-count col-12">
                    <div className="flex-box d-flex justify-content-between align-items-center">
                      <h6>Giá Mua </h6>
                      <span>{product.price && showPrice(product.price)}</span>
                    </div>
                    {/* <div className="flex-box d-flex justify-content-between align-items-center">
                      <h6 style={{ color: "red" }}>Giá Thuê </h6>
                      <span>
                        {product.loanPrice && showPrice(product.loanPrice)}
                      </span>
                    </div> */}
                    <div className="flex-box d-flex justify-content-between align-items-center">
                      <h6>Trạng thái</h6>
                      {product.countInStock > 0 ? (
                        <>
                          <span>Số lượng tồn kho</span> <span style={{ color: 'red' }}>{product.countInStock}</span>
                        </>
                      ) : (
                        <span>Hết hàng</span>
                      )}
                    </div>
                    <div className="flex-box d-flex justify-content-between align-items-center">
                      <h6>Đánh giá</h6>
                      <Rating
                        value={product.rating || 0}
                        text={`${product.numReviews || 0} đánh giá`}
                      />
                    </div>
                    {product.countInStock > 0 ? (
                      <>
                        <div className="flex-box d-flex justify-content-between align-items-center">
                          <h6>Số lượng</h6>
                          <div className="qty-control">
                            <button
                              type="button"
                              className="qty-btn"
                              disabled={qty <= 1}
                              onClick={() => setQty(q => Math.max(1, Number(q) - 1))}
                            >−</button>
                            <input
                              type="number"
                              className="qty-input"
                              value={qty}
                              min={1}
                              max={product.countInStock}
                              onChange={(e) => {
                                const v = Math.max(1, Math.min(product.countInStock, Number(e.target.value) || 1));
                                setQty(v);
                              }}
                            />
                            <button
                              type="button"
                              className="qty-btn"
                              disabled={qty >= product.countInStock}
                              onClick={() => setQty(q => Math.min(product.countInStock, Number(q) + 1))}
                            >+</button>
                          </div>
                        </div>
                        <div className="product-action-row">
                          <button
                            onClick={AddToCartHandle}
                            className="round-black-btn"
                            style={{ background: 'var(--color-primary)', marginRight: '8px' }}
                          >
                            <i className="fas fa-shopping-cart"></i> Thêm vào giỏ
                          </button>
                          <button
                            onClick={BuyNowHandle}
                            className="round-black-btn"
                          >
                            <i className="fas fa-bolt"></i> Mua ngay
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* RATING */}
            <div className="row my-5">
              <div className="col-md-6">
                <h6 className="mb-3">Đánh giá</h6>
                {product.reviews.length === 0 && (
                  <Message variant={"alert-info mt-3"}>
                    Chưa có đánh giá nào...
                  </Message>
                )}
                {product.reviews.map((review) => (
                  <div
                    key={review._id}
                    className="mb-5 mb-md-3 bg-light p-3 shadow-sm rounded"
                  >
                    <strong>{review.userName || review.name}</strong>
                    <Rating value={review.rating} />
                    <span>{moment(review.createdAt).calendar()}</span>
                    <div className="alert alert-info mt-3">
                      {review.comment}
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                <h6>Bài đánh giá của khách hàng</h6>
                <div className="my-4">
                  {loadingCreateReview && <Loading />}
                  {errorCreateReview && (
                    <Message variant="alert-danger">
                      {errorCreateReview}
                    </Message>
                  )}
                </div>
                {userInfo ? (
                  <form onSubmit={submitHandler}>
                    <div className="my-4">
                      <strong>Xếp hạng</strong>
                      <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="col-12 bg-light p-3 mt-2 border-0 rounded"
                      >
                        <option value="">Chọn đánh giá...</option>
                        <option value="1">1 Sao</option>
                        <option value="2">2 Sao</option>
                        <option value="3">3 Sao</option>
                        <option value="4">4 Sao</option>
                        <option value="5">5 Sao</option>
                      </select>
                    </div>
                    <div className="my-4">
                      <strong>Bình luận</strong>
                      <textarea
                        row="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="col-12 bg-light p-3 mt-2 border-0 rounded"
                      ></textarea>
                    </div>
                    <div className="my-3">
                      <button
                        disabled={loadingCreateReview}
                        className="col-12 bg-black border-0 p-3 rounded text-white"
                      >
                        SUBMIT
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="my-3">
                    <Message variant={"alert-warning"}>
                      Xin{" "}
                      <Link to="/login">
                        " <strong>Đăng nhập</strong> "
                      </Link>{" "}
                      Viết bài đánh giá{" "}
                    </Message>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SingleProduct;
