import { Button, Checkbox, Col, Input, Row, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import AddressAPI from "../API/AddressAPI";
import MoMo from "../Checkout/MoMo";
import { forIn } from "lodash";
import MessageNotify from "../Message/Message";
import CouponAPI from "../API/CouponAPI";
import NoteAPI from "../API/NoteAPI";
import { getUserCookie } from "../helper";
import OrderAPI from "../API/OrderAPI";
import Detail_OrderAPI from "../API/Detail_OrderAPI";
import CartAPI from "../API/CartAPI";
import { addCart } from "../Redux/Action/ActionCart";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import User from "../API/User";

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
  jsonp: false,
});
socket.connect();
function PhoneNumber(number) {
  return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
}
function ConfirmPayment() {
  const listCard = useSelector((state) => state.Cart.listCart);
  const dispatch = useDispatch();
  const history = useHistory();
  const coupon = JSON.parse(localStorage.getItem("coupon"));
  const discount = coupon ? Number(coupon.promotion) : 0;
  const totalPrice =
    listCard &&
    listCard.reduce(
      (prev, curIt) => prev + curIt.price_product * curIt.count || 0,
      0
    );
  const [province, setProvince] = useState([]);
  const [district, setDistrict] = useState([]);
  const [wards, setWards] = useState([]);
  const [messageObj, setMessageObj] = useState({
    type: "",
    content: "",
    active: 0,
  });
  const [state, setState] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    province: null,
    district: null,
    wards: null,
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState({
    cod: false,
    vnpay: false,
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await AddressAPI.getProvince();
      if (response.code === 200) {
        setProvince(response.data);
      }
    };
    const fetchDataUser = async () => {
      const response = await User.Get_User(getUserCookie());
      setState({ ...state, email: response.email });
    };

    fetchDataUser();

    fetchData();
  }, []);
  useEffect(() => {
    setState({ ...state, district: null, wards: null });
    if (state.province) {
      const fetchData = async () => {
        const response = await AddressAPI.getDistrict({
          province_id: state.province,
        });
        if (response.code === 200) {
          setDistrict(response.data);
        }
      };

      fetchData();
    }
  }, [state.province]);
  useEffect(() => {
    setState({
      ...state,
      wards: null,
    });
    if (state.district) {
      const fetchData = async () => {
        const response = await AddressAPI.getWards({
          district_id: state.district,
        });
        if (response.code === 200) {
          setWards(response.data);
        }
      };

      fetchData();
    }
  }, [state.district]);
  const handleChangeValue = (type, value) => {
    let newValue = {};
    newValue[type] = value;
    setState({ ...state, ...newValue });
  };
  const handleConfirm = async () => {
    if (!PhoneNumber(state.phoneNumber)) {
      setMessageObj({
        type: "error",
        content: "Vui lòng nhập đúng định dạng số điện thoại!",
        active: new Date() * 1,
      });
      return;
    }
    for (const property in state) {
      console.log(`${property}: ${state[property]}`);
      if (!state[property] && property !== "note") {
        setMessageObj({
          type: "error",
          content: "Vui lòng nhập đầy đủ thông tin đặt hàng!",
          active: new Date() * 1,
        });
        return;
      }
    }
    if (localStorage.getItem("id_coupon")) {
      const responseUpdate = await CouponAPI.updateCoupon(
        localStorage.getItem("id_coupon")
      );
      console.log(responseUpdate);
    }

    const data_delivery = {
      fullname: state.name,
      phone: state.phoneNumber,
    };
    const responseDelivery = await NoteAPI.post_note(data_delivery);
    const dataCoupon = localStorage.getItem("coupon")
      ? JSON.parse(localStorage.getItem("coupon"))
      : null;
    if (dataCoupon) {
      await NoteAPI.post_coupon_count({
        id: dataCoupon._id,
        count: dataCoupon.count - 1,
      });
    }
    const provinceItem = province.find((it) => it.value === state.province);
    const districtItem = district.find((it) => it.value === state.district);
    const wardsItem = wards.find((it) => it.value === state.wards);

    let addressNew = ` ${state.address} - ${wardsItem.label} - ${districtItem.label} - ${provinceItem.label} `;

    const dataOrder = {
      id_user: getUserCookie(),
      full_name: state.name,
      address: addressNew,
      total: totalPrice - (totalPrice * discount) / 100 + 30000,
      status: "1",
      pay: false,
      id_payment: "6086709cdc52ab1ae999e882",
      id_note: responseDelivery._id,
      feeship: 30000,
      id_coupon: localStorage.getItem("id_coupon")
        ? localStorage.getItem("id_coupon")
        : "",
      create_time: `${new Date().getDate()}/${
        parseInt(new Date().getMonth()) + 1
      }/${new Date().getFullYear()}`,
    };
    const responseOrder = await OrderAPI.post_order(dataOrder);
    for (let i = 0; i < listCard.length; i++) {
      const dataDetailOrder = {
        id_order: responseOrder._id,
        id_product: listCard[i].id_product,
        name_product: listCard[i].name_product,
        price_product: listCard[i].price_product,
        count: listCard[i].count,
        size: listCard[i].size,
      };
      const data = await Detail_OrderAPI.post_detail_order(dataDetailOrder);
      if (data.code !== 200) {
        setMessageObj({
          type: "error",
          content: data.message,
          active: new Date() * 1,
        });
        return;
      }
    }
    const dataRes = await CartAPI.Delete_All_Cart({ id_user: getUserCookie() });
    if (dataRes.code == 200) {
      dispatch(addCart(dataRes.data));
    }
    setMessageObj({
      type: "success",
      content: "Đặt hàng thành công",
      active: new Date() * 1,
    });
    setTimeout(() => {
      history.push("/");
    }, 1000);
    socket.emit("send_order", "Có người vừa đặt hàng");
    localStorage.removeItem("id_coupon");
    localStorage.removeItem("coupon");
  };
  return (
    <div>
      <div className="breadcrumb-area">
        <div className="container">
          <div className="breadcrumb-content">
            <ul>
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li className="active">Xác nhận đơn hàng</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container" style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "500", marginTop: "30px" }}>
          Thông tin giao hàng
        </h2>
        <div>
          <Row gutter={[16, 24]}>
            <Col span={12}>
              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <Input
                    value={state.name}
                    onChange={(e) => handleChangeValue("name", e.target.value)}
                    placeholder="Họ và tên"
                  />
                </Col>

                <Col span={18}>
                  <Input
                    value={state.email}
                    // onChange={(e) => handleChangeValue("email", e.target.value)}
                    type="email"
                    disabled
                    placeholder="Email"
                  />
                </Col>
                <Col span={6} className="phone-number">
                  <Input
                    value={state.phoneNumber}
                    type="number"
                    onChange={(e) =>
                      handleChangeValue("phoneNumber", e.target.value)
                    }
                    placeholder="Số điện thoại"
                  />
                </Col>

                <Col span={12}>
                  <Select
                    value={state.province}
                    style={{ width: "100%", height: "45px" }}
                    placeholder="Tỉnh/Thành Phố"
                    onChange={(e) => handleChangeValue("province", e)}
                    options={province}
                  />
                </Col>
                <Col span={12}>
                  <Select
                    value={state.district}
                    style={{ width: "100% ", height: "45px" }}
                    placeholder="Quận/Huyện"
                    onChange={(e) => handleChangeValue("district", e)}
                    options={district}
                  />
                </Col>

                <Col span={12} className="gutter-row">
                  <Select
                    value={state.wards}
                    style={{ width: "100% ", height: "45px" }}
                    placeholder="Phường/xã"
                    onChange={(e) => handleChangeValue("wards", e)}
                    options={wards}
                  />
                </Col>
                <Col span={24}>
                  <Input
                    value={state.address}
                    onChange={(e) =>
                      handleChangeValue("address", e.target.value)
                    }
                    placeholder="Địa chỉ"
                  />
                </Col>

                {/* <Col span={24}>
                  <TextArea
                    value={state.note}
                    placeholder="Ghi chú"
                    onChange={(e) => handleChangeValue("note", e.target.value)}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </Col> */}
              </Row>
              {/* <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "500",
                  margin: "10px 0 15px",
                }}
              >
                Phương thức thanh toán
              </h2> */}
              {/* <Row gutter={[16, 24]}>
                  <Col span={24}>
                    <div style={{ border: "1px solid #d9d9d9" }}>
                      <div
                        style={{
                          padding: "20px 30px",
                          borderBottom: "1px solid #d9d9d9",
                        }}
                      >
                        <Checkbox
                          checked={paymentMethod.cod}
                          onChange={(e) => {
                            setPaymentMethod({
                              vnpay: false,
                              cod: e.target.checked,
                            });
                          }}
                        />
                        <span style={{ marginLeft: "10px" }}>
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "30px 0",
                          display: "flex",
                          alignItems: "center",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <div>- Kiểm tra hàng trước khi thanh toán</div>
                        <div>- Hỗ trợ đổi hàng trong vòng 5 ngày</div>
                      </div>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div style={{ border: "1px solid #d9d9d9" }}>
                      <div
                        style={{
                          padding: "20px 30px",
                          borderBottom: "1px solid #d9d9d9",
                        }}
                      >
                        <Checkbox
                          checked={paymentMethod.vnpay}
                          onChange={(e) => {
                            setPaymentMethod({
                              cod: false,
                              vnpay: e.target.checked,
                            });
                          }}
                        />
                        <span style={{ marginLeft: "10px" }}>
                          Thanh toán qua VNPay
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "30px 0",
                          display: "flex",
                          alignItems: "center",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <div>- Kiểm tra hàng trước khi thanh toán</div>
                        <div>- Hỗ trợ đổi hàng trong vòng 5 ngày</div>
                      </div>
                    </div>
                    {/* <MoMo orderID={1234} total={198000} /> */}
              {/* </Col>
                </Row> */}
            </Col>
            <Col span={4} />
            <Col span={8}>
              <Row gutter={[16, 24]}>
                {listCard &&
                  listCard.map((it) => (
                    <Col span={24}>
                      <Row>
                        <Col span={4}>
                          <img
                            width={70}
                            height={70}
                            src={it?.image}
                            alt="image-product"
                          />
                        </Col>
                        <Col span={14} style={{ padding: "0 10px" }}>
                          <div
                            style={{ textTransform: "uppercase" }}
                          >{`${it.name_product} - ${it.size}`}</div>
                          <div>x{it.count}</div>
                        </Col>
                        <Col span={6}>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "decimal",
                            decimal: "VND",
                          }).format(+it.price_product * +it.count || 0) +
                            " VNĐ"}
                        </Col>
                      </Row>
                    </Col>
                  ))}

                <div
                  style={{
                    height: "2px",
                    width: "100%",
                    background: "rgba(0,0,0,0.2)",
                  }}
                />
                <Col span={24}>
                  <Row>
                    <Col style={{ fontWeight: "500" }} span={18}>
                      Giảm giá sản phẩm {discount}%
                    </Col>
                    {console.log(discount)}
                    <Col span={6}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "decimal",
                        decimal: "VND",
                      }).format((totalPrice * discount) / 100) + " VNĐ"}
                    </Col>
                  </Row>
                </Col>
                <Col span={24}>
                  <Row>
                    <Col style={{ fontWeight: "500" }} span={18}>
                      Phí ship
                    </Col>

                    <Col span={6}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "decimal",
                        decimal: "VND",
                      }).format(30000) + " VNĐ"}
                    </Col>
                  </Row>
                </Col>
                <Col span={24}>
                  <Row>
                    <Col style={{ fontWeight: "500" }} span={18}>
                      Tổng cộng
                    </Col>

                    <Col span={6}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "decimal",
                        decimal: "VND",
                      }).format(
                        totalPrice - (totalPrice * discount) / 100 + 30000
                      ) + " VNĐ"}
                    </Col>
                  </Row>
                </Col>
                <Col
                  style={{ border: "1px solid #e98811", padding: "10px" }}
                  span={24}
                >
                  BULI sẽ xác nhận đơn hàng bằng cách gọi điện thoại. Bạn vui
                  lòng để ý điện thoại khi đặt hàng thành công và chờ nhận hàng.
                  Cảm ơn bạn !
                </Col>
                <Col span={24}>
                  <Row>
                    <Col span={18} />

                    <Col span={6}>
                      <Button
                        type="primary"
                        style={{
                          background: "#fed700",
                          color: "#242424",
                          width: "150px",
                          marginLeft: "-40px",
                        }}
                        onClick={handleConfirm}
                      >
                        Thanh toán COD
                      </Button>
                      {/* <Button
                        type="primary"
                        style={{
                          background: "#fed700",
                          color: "#242424",
                          marginTop: "10px",
                          width: "150px",
                          marginLeft: "-40px",
                        }}
                        onClick={handleConfirm}
                      >
                        Thanh toán VNPAY
                      </Button> */}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
      <MessageNotify
        type={messageObj.type}
        content={messageObj.content}
        active={messageObj.active}
      />
    </div>
  );
}

export default ConfirmPayment;
