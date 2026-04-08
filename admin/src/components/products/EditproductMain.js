import React, { useState, useEffect, useRef } from "react";
import Toast from "./../LoadingError/Toast";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  editProduct,
  updateProduct,
} from "./../../Redux/Actions/ProductActions";
import { PRODUCT_UPDATE_RESET } from "../../Redux/Constants/ProductConstants";
import { toast } from "react-toastify";
import Message from "../LoadingError/Error";
import Loading from "../LoadingError/Loading";
import axios from "axios";
import CropEasy from "../crop/CropEasy";
import { imageShow, imageUpload } from "../../ulities/imageUpload";

const ToastObjects = {
  pauseOnFocusLoss: false,
  draggable: false,
  pauseOnHover: false,
  autoClose: 2000,
};

const EditProductMain = (props) => {
  const { productId } = props;

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState(null);
  const [countInStock, setCountInStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [description, setDescription] = useState("");
  const [loanPrice, setLoanPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [listCategory, setListCategory] = useState([]);
  const [preview, setPreview] = useState("");
  const [bought, setBought] = useState(false);

  const [file, setFile] = useState(null);
  const [photoURL, setPhotoURL] = useState();
  const [openCrop, setOpenCrop] = useState(false);
  const [checkCrop, setCheckCrop] = useState(false);
  const [originalFileName, setOriginalFileName] = useState("image.jpg");
  const fileRef = useRef();

  const dispatch = useDispatch();

  const productEdit = useSelector((state) => state.productEdit);
  const { loading, error, product } = productEdit;

  const productUpdate = useSelector((state) => state.productUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = productUpdate;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/category/all/status/no");
        if (res.status === 200) {
          const cats = res.data?.data ?? res.data;
          setListCategory(Array.isArray(cats) ? cats : []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChangeImages = (e) => {
    const files = [...e.target.files];
    setPreview("");
    setImages(files[0]);
  };

  useEffect(() => {
    dispatch(editProduct(productId));
  }, [productId]);

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      toast.success("Product Updated", ToastObjects);
    }
  }, [successUpdate]);

  useEffect(() => {
    if (product && product.name && String(product.id) === String(productId)) {
      setName(product.name);
      setDescription(product.description);
      setCountInStock(product.countInStock);
      setLowStockThreshold(product.lowStockThreshold ?? 10);
      setPrice(product.price);
      setLoanPrice(product.loanPrice);
      setCategory(product.category?.id ?? product.category ?? "");
      setPreview(product.image);
      setBought(product.isBought);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const image = await imageUpload(images);
    const categoryId = category ? Number(category) : null;
    if (image) {
      dispatch(
        updateProduct({
          id: productId,
          name,
          price,
          description,
          image,
          countInStock,
          lowStockThreshold,
          loanPrice,
          category: categoryId,
          bought
        })
      );
    } else {
      dispatch(
        updateProduct({
          id: productId,
          name,
          price,
          description,
          image : preview,
          countInStock,
          lowStockThreshold,
          loanPrice,
          category: categoryId,
          bought
        })
      );
    }
  };

  useEffect(() => {
    if (checkCrop) {
      setPreview("");
      const namedFile = new File([file], originalFileName, { type: file.type });
      setImages(namedFile);
      fileRef.current.value = null;
      setCheckCrop(false);
    }
  }, [checkCrop]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalFileName(file.name);
      setFile(file);
      setPhotoURL(URL.createObjectURL(file));
      setOpenCrop(true);
    }
  };

  return (
    <>
      <Toast />
      <section className="content-main" style={{ maxWidth: "1200px" }}>
        <form onSubmit={submitHandler}>
          <div className="content-header">
            <div className="d-flex align-items-center gap-2">
              <Link to="/products" className="btn btn-danger text-white">
                Đi đến trang chủ sản phẩm
              </Link>
              <button type="submit" className="btn btn-primary">
                Cập nhật
              </button>
            </div>
            <h2 className="content-title">Cập nhật sản phẩm</h2>
          </div>

          <div className="row mb-4">
            <div className="col-xl-8 col-lg-8">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  {errorUpdate && (
                    <Message variant="alert-danger">{errorUpdate}</Message>
                  )}
                  {loadingUpdate && <Loading />}
                  {loading ? (
                    <Loading />
                  ) : error ? (
                    <Message variant="alert-danger">{error}</Message>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label htmlFor="product_title" className="form-label">
                          Tiêu đề
                        </label>
                        <input
                          type="text"
                          placeholder="Type here"
                          className="form-control"
                          id="product_title"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                          </div>
                          {/* <div className="mb-4">
                    <label htmlFor="product_title" className="form-label" style={{ display: 'block' }}>
                      Chỉ được mua ở web
                    </label>
                    <input
                      type="checkbox"
                      className="block"
                      checked={bought}
                      value={bought}
                      onChange={(e) => setBought(!bought)}
                    />
                  </div> */}
                      <div className="mb-4">
                        <label htmlFor="product_price" className="form-label">
                          Giá
                        </label>
                        <input
                          type="number"
                          placeholder="Type here"
                          className="form-control"
                          id="product_price"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="product_threshold" className="form-label">
                          Ngưỡng cảnh báo tồn kho
                        </label>
                        <input
                          type="number"
                          placeholder="Type here"
                          className="form-control"
                          id="product_threshold"
                          min="0"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="product_price" className="form-label">
                          Danh Mục
                        </label>
                        <select
                          className="form-control"
                          onChange={(e) => setCategory(e.target.value)}
                          value={category ? String(category) : ""}
                        >
                          <option value=""></option>
                          {listCategory.map((item) => (
                            <option key={item.id} value={String(item.id)}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="product_price" className="form-label">
                          Tồn kho
                        </label>
                        <input
                          type="number"
                          placeholder="Type here"
                          className="form-control"
                          id="product_price"
                          required
                          value={countInStock}
                          onChange={(e) => setCountInStock(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label">Description</label>
                        <textarea
                          placeholder="Type here"
                          className="form-control"
                          rows="7"
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="mb-4">
                        <input
                          className="form-control mt-3"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                          ref={fileRef}
                        />
                      </div>
                      <div className="mb-4">
                        {(preview && imageShow(preview)) ||
                          (images?.name &&
                            imageShow(URL.createObjectURL(images)))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
        {openCrop && (
          <CropEasy
            {...{ photoURL, setOpenCrop, setPhotoURL, setFile, setCheckCrop }}
          />
        )}
      </section>
    </>
  );
};

export default EditProductMain;
