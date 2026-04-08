import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import Pagination from "./pagination";
import { useDispatch, useSelector } from "react-redux";
import { listProduct } from "../../Redux/Actions/ProductActions";
import Loading from "../LoadingError/Loading";
import Message from "../LoadingError/Error";
import Category from "./Category";
import { useParams } from "react-router-dom";
import axios from "axios";
import Slide from "./Slide";
import FeaturedBrandsSection from "./FeaturedBrandsSection";

const ShopSection = (props) => {
  const { keyword, pagenumber } = props;
  const dispatch = useDispatch();
  const { item } = useParams();
  const [pr, setPr] = useState([]);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorite')) || []);

  const isFavorited = (id) => favorites.some(f => f.id === id);

  const toggleFavorite = (product) => {
    const stored = JSON.parse(localStorage.getItem('favorite')) || [];
    const exists = stored.find(f => f.id === product.id);
    let updated;
    if (exists) {
      updated = stored.filter(f => f.id !== product.id);
    } else {
      updated = [...stored, { id: product.id, name: product.name, img: product.image, price: product.price, quantity: 1 }];
    }
    localStorage.setItem('favorite', JSON.stringify(updated));
    setFavorites(updated);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  useEffect(() => {
    const fetchProducts = async () => {
      if (item) {
        const res = await axios.get(`/api/products/searchHere/${item}`);
        if (res.status === 200) {
          setPr(res.data.data || []);
        }
      } else {
        dispatch(listProduct(keyword, pagenumber));
      }
    };
    fetchProducts();
  }, [dispatch, keyword, pagenumber, item]);

  const showPrice = (price) => {
    return price.toLocaleString("it-IT", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <>
      <div className="banner-fluid-wrapper">
        <Slide />
        <FeaturedBrandsSection />
      </div>
      <div className="container" style={{ paddingTop: "20px" }}>
        <Category />
        <div className="section">
          <div className="section-heading">
            <h2>Sản phẩm nổi bật</h2>
            <p>Khám phá hàng nghìn sản phẩm chăm sóc sức khoẻ chất lượng cao</p>
            <div className="line"></div>
          </div>
          <div className="row">
            <div className="col-lg-12 col-md-12 article">
              <div className="shopcontainer row">
                {loading ? (
                  <div className="mb-5">
                    <Loading />
                  </div>
                ) : error ? (
                  <Message variant="alert-danger">{error}</Message>
                ) : item ? (
                  <>
                    {pr.map((product) => (
                      <div
                        className="shop col-lg-4 col-md-6 col-sm-6"
                        key={product.id}
                      >
                        <div className="border-product">
                          <Link to={`/products/${product.id}`}>
                            <div className="shopBack">
                              <img src={product.image} alt={product.name} />
                            </div>
                          </Link>
                          <i
                            className={`fas fa-heart heart${isFavorited(product.id) ? ' bg-red' : ''}`}
                            onClick={() => toggleFavorite(product)}
                            title={isFavorited(product.id) ? 'Xoá khỏi yêu thích' : 'Thêm vào yêu thích'}
                          ></i>

                          <div className="shoptext">
                            <p>
                              <Link to={`/products/${product.id}`}>
                                {product.name} - {product.ma}
                              </Link>
                            </p>

                            <Rating
                              value={product.rating || 0}
                              text={`${product.numReviews || 0} đánh giá`}
                            />
                            <h3
                              style={{
                                display: "inline-block",
                              }}
                            >
                              {showPrice(product.price)}
                            </h3>
                            {/* <h3
                            style={{
                              float: "right",
                              fontSize: "14px",
                              color: "red",
                            }}
                          >
                            Giá thuê : {showPrice(product.loanPrice)}
                          </h3> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {products.map((product) => (
                      <div
                        className="shop col-lg-4 col-md-6 col-sm-6"
                        key={product.id}
                      >
                        <div className="border-product">
                          <Link to={`/products/${product.id}`}>
                            <div className="shopBack">
                              <img src={product.image} alt={product.name} />
                            </div>
                          </Link>
                          <i
                            className={`fas fa-heart heart${isFavorited(product.id) ? ' bg-red' : ''}`}
                            onClick={() => toggleFavorite(product)}
                            title={isFavorited(product.id) ? 'Xoá khỏi yêu thích' : 'Thêm vào yêu thích'}
                          ></i>

                          <div className="shoptext">
                            <p>
                              <Link to={`/products/${product.id}`}>
                                {product.name} - {product.ma}
                              </Link>
                            </p>

                            <Rating
                              value={product.rating || 0}
                              text={`${product.numReviews || 0} đánh giá`}
                            />
                            <h3
                              style={{
                                display: "inline-block",
                              }}
                            >
                              {showPrice(product.price)}
                            </h3>
                            {/* <h3
                                style={{
                                  float: "right",
                                  fontSize: "14px",
                                  color: "red",
                                }}
                              >
                                Giá thuê : {showPrice(product.loanPrice)}
                              </h3> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Pagination */}
                <Pagination
                  pages={pages}
                  page={page}
                  keyword={keyword ? keyword : ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopSection;
