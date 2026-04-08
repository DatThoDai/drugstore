import axios from "axios";
import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

const Category = () => {
  const [listCategory, setListCategory] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeParent, setActiveParent] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const history = useHistory();
  const { item } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/category/all/status");
        if (res.status === 200) {
          setListCategory(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleParentClick = async (id) => {
    // Toggle: click again to close
    if (activeParent === id) {
      setActiveParent(null);
      setSubcategories([]);
      return;
    }

    setActiveParent(id);
    setLoadingSub(true);
    try {
      const res = await axios.get(`/api/category/all/status-detail/${id}`);
      if (res.status === 200) {
        setSubcategories(res.data.data || []);
      }
    } catch (error) {
      setSubcategories([]);
    } finally {
      setLoadingSub(false);
    }
  };

  const handleSubClick = (subId) => {
    history.push(`/category/${subId}`);
  };

  return (
    <div className="category-wrapper">
      {/* Parent categories */}
      <div className="row">
        <ul className="menu">
          {listCategory.map((cat) => (
            <li
              key={cat.id}
              className={activeParent === cat.id ? "active menu-item" : "menu-item"}
              onClick={() => handleParentClick(cat.id)}
            >
              {cat.name}
              <i className="fas fa-chevron-down"></i>
            </li>
          ))}
        </ul>
      </div>

      {/* Subcategories — inline row */}
      {activeParent && (
        <div className="subcategory-row">
          {loadingSub ? (
            <span className="subcategory-empty">Đang tải...</span>
          ) : subcategories.length > 0 ? (
            subcategories.map((sub) => (
              <span
                key={sub.id}
                className={`subcategory-chip${item === (sub.id || sub._id) ? ' active-sub' : ''}`}
                onClick={() => handleSubClick(sub.id || sub._id)}
              >
                {sub.name}
              </span>
            ))
          ) : (
            <span className="subcategory-empty">Không có danh mục con</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Category;
