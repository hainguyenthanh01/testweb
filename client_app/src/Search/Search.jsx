import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";
import queryString from "query-string";
import Product from "../API/Product";
import "./Search.css";
import { Link } from "react-router-dom";
import CartsLocal from "../Share/CartsLocal";
import { changeCount } from "../Redux/Action/ActionCount";
import { useDispatch, useSelector } from "react-redux";
import { TiMinus, TiPlus } from "react-icons/ti";
import { Rate } from "antd";
import { getUserCookie } from "../helper";
import Cart from "../API/CartAPI";
import { addCart } from "../Redux/Action/ActionCart";

Search.propTypes = {};

function Search(props) {
  const [id_modal, set_id_modal] = useState("");
  const [product_detail, set_product_detail] = useState([]);
  const [products, set_products] = useState([]);
  const [page, set_page] = useState(1);
  const dispatch = useDispatch();
  const [show_load, set_show_load] = useState(false);
  const count_change = useSelector((state) => state.Count.isLoad);
  const [sortBy, setSortBy] = useState("")
  useEffect(() => {
    if (id_modal !== "") {
      const fetchData = async () => {
        const response = await Product.Get_Detail_Product(id_modal);

        set_product_detail(response);
      };

      fetchData();
    }
  }, [id_modal]);

  useEffect(() => {
    const fetchData = async () => {
      const params = {
        page: page,
        count: "6",
        search: localStorage.getItem("search"),
      };

      const query = "?" + queryString.stringify(params);

      const response = await Product.get_search_list(query);

      if (response.length < 1) {
        set_show_load(false);
      }

      set_products((prev) => [...prev, ...response]);
    };

    fetchData();
  }, [page]);

  return (
    <div className="content-wraper pt-60 pb-60">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="shop-top-bar">
              <div className="product-select-box">
                <div className="product-short">
                  <p>Sắp xếp:</p>
                  <select className="nice-select">
                    <option value="trending">Giá</option>
                    <option value="rating">Giá (Thấp đến Cao)</option>
                    <option value="rating">Giá (Cao đến Thấp)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="shop-products-wrapper">
              <div className="row">
                <div className="col">
                  <InfiniteScroll
                    style={{ overflow: "none" }}
                    dataLength={products.length}
                    next={() => set_page(page + 1)}
                    hasMore={true}
                    loader={
                      <h4
                        className="text-center"
                        style={{ paddingTop: "3rem", color: "#FED700" }}
                      >
                        Bạn đã xem hết sản phẩm
                      </h4>
                    }
                  >
                    {products &&
                      products.map((value) => (
                        <div
                          className="row product-layout-list"
                          key={value._id}
                        >
                          <div className="col-lg-3 col-md-5 ">
                            <div className="product-image">
                              <Link to={`/detail/${value._id}`}>
                                <img
                                  src={value.image}
                                  alt="Li's Product Image"
                                />
                              </Link>
                              <span className="sticker">Mới</span>
                            </div>
                          </div>
                          <div className="col-lg-5 col-md-7">
                            <div className="product_desc">
                              <div className="product_desc_info">
                                <div className="product-review">
                                  <h5 className="manufacturer">
                                    <Link to={`/detail/${value._id}`}>
                                      {value.name_product}
                                    </Link>
                                  </h5>
                                  <div className="rating-box">
                                    <ul className="rating">
                                      <Rate
                                        style={{ fontSize: "14px" }}
                                        disabled
                                        allowHalf
                                        defaultValue={value.star}
                                      />
                                    </ul>
                                  </div>
                                </div>
                                <h4 style={{display: "flex"}}>
                                  <Link to={`/detail/${value._id}`}>
                                    <a className="product_name" href="">
                                      {value.name_product}
                                    </a>
                                  </Link>
                                </h4>
                                <div className="price-box">
                                  <span className="new-price">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "decimal",
                                      decimal: "VND",
                                    }).format(value.price_product) + " VNĐ"}
                                  </span>
                                </div>
                                <p>{value.describe}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </InfiniteScroll>
                </div>
              </div>
            </div>
          </div>
        </div>

        {products &&
          products.map((value) => (
            <div
              className="modal fade modal-wrapper"
              key={value._id}
              id={value._id}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-body">
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                    <div className="modal-inner-area row">
                      <div className="col-lg-5 col-md-6 col-sm-6">
                        <div className="product-details-left">
                          <div className="product-details-images slider-navigation-1">
                            <div className="lg-image">
                              <img src={value.image} alt="product image" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-7 col-md-6 col-sm-6">
                        <div className="product-details-view-content pt-60">
                          <div className="product-info">
                            <h2>{value.name_product}</h2>
                            <div className="rating-box pt-20">
                              <ul className="rating rating-with-review-item">
                                <Rate
                                  style={{ fontSize: "14px" }}
                                  disabled
                                  allowHalf
                                  defaultValue={value.star}
                                />
                              </ul>
                            </div>
                            <div className="price-box pt-20">
                              <span className="new-price new-price-2">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "decimal",
                                  decimal: "VND",
                                }).format(value.price_product) + " VNĐ"}
                              </span>
                            </div>
                            <div className="product-desc">
                              <p>
                                <span>{value.describe}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Search;
