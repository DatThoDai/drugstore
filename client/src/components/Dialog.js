import { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import { useHistory, useParams } from "react-router-dom";

const Dialog = ({ idParent, isOpenDialog, setCloseDialog, onClickOpen }) => {
  const [listItem, setListItem] = useState([]);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (idParent) {
      fetchData();
    }
  }, [idParent]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/category/all/status-detail/${idParent}`
      );
      if (res.status === 200) {
        setListItem(res.data.data || []);
      }
    } catch (error) {
      setListItem([]);
    } finally {
      setLoading(false);
    }
  };

  const redirectPage = (href) => {
    history.push(`/category/${href}`);
  };

  return (
    <>
      {isOpenDialog && (
        <div className="main-pop-up" onClick={setCloseDialog}>
          <div className="pop-up">
            {loading ? (
              <div className="loading">
                <ClipLoader
                  color={"#36d7b7"}
                  loading={loading}
                  size={35}
                  speedMultiplier={1}
                />
              </div>
            ) : (
              <ul className="menu menu-dialog">
                {listItem.length > 0 ? (
                  listItem.map((o) => (
                    <li
                      key={o.id}
                      className="menu-item-con item-dialog"
                      onClick={() => redirectPage(o.id || o._id)}
                    >
                      {o.name}
                    </li>
                  ))
                ) : (
                  <h3>Không Có Danh Mục</h3>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Dialog;
