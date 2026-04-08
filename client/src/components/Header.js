import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/Actions/userActions";
import { listSearch } from "..//Redux/Actions/ProductActions";
import Logo from "../phamacity.jpg"

const Header = () => {
  const [keyword, setKeyword] = useState();
  const dispatch = useDispatch();
  let history = useHistory();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const [listStore, setListStore] = useState(JSON.parse(localStorage.getItem('favorite'))|| []);

  useEffect(() => {
    const syncFavorites = () => {
      setListStore(JSON.parse(localStorage.getItem('favorite')) || []);
    };
    window.addEventListener('favoritesUpdated', syncFavorites);
    return () => window.removeEventListener('favoritesUpdated', syncFavorites);
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
  };


  const submitHandler = (e) => {
    e.preventDefault();
    keyword.trim();
    dispatch(listSearch(keyword));
    history.push(`/search/${keyword}`);
  };


  return (
    <div>

      <div className="Announcement ">
        <div className="container">
          <div className="row">
            <div className="col-md-6 d-flex align-items-center display-none">
              <p>+84 123 456 789</p>
              <p>phama@gmail.com</p>
            </div>
            <div className=" col-12 col-lg-6 justify-content-center justify-content-lg-end d-flex align-items-center">
              <Link to="">
                <i className="fab fa-facebook-f"></i>
              </Link>
              <Link to="">
                <i className="fab fa-instagram"></i>
              </Link>
              <Link to="">
                <i className="fab fa-linkedin-in"></i>
              </Link>
              <Link to="">
                <i className="fab fa-youtube"></i>
              </Link>
              <Link to="">
                <i className="fab fa-pinterest-p"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="header">
        <div className="container">

          <div className="mobile-header">
            <div className="container ">
              <div className="row ">
                <div className="col-6 d-flex align-items-center">
                  <Link className="navbar-brand" to="/">
                    <img alt="logo" src={Logo} />
                  </Link>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-end Login-Register">
                  {userInfo ? (
                    <div className="btn-group">
                      <button
                        type="button"
                        className="name-button dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="fas fa-user"></i>
                      </button>
                      <div className="dropdown-menu">
                        <Link className="dropdown-item" to="/profile">
                          Trang cá nhân
                        </Link>
                        <Link
                          className="dropdown-item"
                          to="#"
                          onClick={logoutHandler}
                        >
                          Đăng xuất
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="btn-group">
                      <button
                        type="button"
                        className="name-button dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                      <i className="fas fa-user"></i>
                    </button>
                      <div className="dropdown-menu">
                        <Link className="dropdown-item" to="/login">
                          Đăng nhập
                        </Link>
                        <Link className="dropdown-item" to="/register">
                          Đăng ký
                        </Link>
                      </div>
                    </div>
                  )}

                  <Link to="/cart" className="cart-mobile-icon" style={{ position: "relative", marginLeft: "12px" }}>
                    <i className="fas fa-shopping-bag"></i>
                    <span className="badge">{cartItems.length}</span>
                  </Link>
                </div>
                <div className="col-12 d-flex align-items-center">
                  <form onSubmit={submitHandler} className="input-group">
                    <input
                      type="search"
                      className="form-control rounded search"
                      placeholder="Search"
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                      search
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>


          <div className="pc-header">
            <div className="row">
              <div className="col-md-2 col-4 d-flex align-items-center mb-4">
                <Link className="navbar-brand" to="/">
                  <img alt="logo" src={Logo} />
                </Link>
              </div>

              <div className="col-md-6 col-8 d-flex align-items-center">
                <form onSubmit={submitHandler} className="input-group">
                  <input
                    type="search"
                    className="form-control rounded search"
                    placeholder="Tìm kiếm sản phẩm..."
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <button type="submit" className="btn btn-success">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>

              <div className="col-md-4 d-flex align-items-center justify-content-end Login-Register">
                {userInfo ? (
                  <div className="btn-group">
                    <button
                      type="button"
                      className="name-button dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Xin chào, {userInfo.name}
                    </button>
                    <div className="dropdown-menu">
                      <Link className="dropdown-item" to="/profile">
                        Trang cá nhân
                      </Link>

                      <Link
                        className="dropdown-item"
                        to="#"
                        onClick={logoutHandler}
                      >
                        Đăng xuất
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/register">Đăng ký</Link>
                    <Link to="/login">Đăng nhập</Link>
                  </>
                )}
                <Link to="/cart" style={{ position: "relative", marginLeft: "16px" }}>
                  <i className="fas fa-shopping-bag" style={{ fontSize: "20px", color: "var(--color-primary)" }}></i>
                  <span className="badge">{cartItems.length}</span>
                </Link>
                <Link to="/favorite" style={{ position: "relative", marginLeft: "16px" }}>
                  <i className="fas fa-heart" style={{ fontSize: "20px", color: "var(--color-danger)" }}></i>
                  <span className="badge">{listStore.length ? listStore.length : 0}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
