import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import queryString from "query-string";

import orderAPI from "../Api/orderAPI";
import Pagination from "../Shared/Pagination";
import Search from "../Shared/Search";

import io from "socket.io-client";
import CustomTable from "../CustomTable/CustomTable";

const socket = io("http://localhost:8000/", {
  transports: ["websocket"],
  jsonp: false,
});
socket.connect();

function ConfirmOrder(props) {
  const [filter, setFilter] = useState({
    page: "1",
    limit: "5",
    status: "1",
    change: true,
  });

  const [order, setOrder] = useState([]);
  const [totalPage, setTotalPage] = useState();
  const [note, setNote] = useState([]);

  useEffect(() => {
    const query = "?" + queryString.stringify(filter);

    const fetchAllData = async () => {
      const od = await orderAPI.getAPI(query);
      const newArray = od.orders.map((it) => {
        it.email = it.id_user?.email || "";
        it.phone = it.id_note.phone;
        it.status = (() => {
          switch (it.status) {
            case "1":
              return "Đang xử lý";
            case "2":
              return "Chờ vận chuyển";
            case "3":
              return "Đang giao";
            case "4":
              return "Hoàn thành";
            default:
              return "Đã hủy";
          }
        })();
        it.pay = it.pay === true ? "Đã thanh toán" : "Chưa thanh toán";
        it.total =
          new Intl.NumberFormat("vi-VN", {
            style: "decimal",
            decimal: "VND",
          }).format(it.total) + " VNĐ";
        return it;
      });
      setTotalPage(od.totalPage);
      setOrder(newArray);
    };

    fetchAllData();
  }, [filter]);

  //Hàm này dùng để nhận socket từ server gửi lên
  useEffect(() => {
    //Nhận dữ liệu từ server gửi lên thông qua socket với key receive_order
    socket.on("receive_order", (data) => {
      setNote(data);
    });
  }, []);

  const handleConfirm = async (value) => {
    const query = "?" + queryString.stringify({ id: value._id });

    const response = await orderAPI.confirmOrder(query);

    if (response.msg === "Thanh Cong") {
      setFilter({
        ...filter,
        change: !filter.change,
      });
    }
  };

  const handleCancel = async (value) => {
    const query = "?" + queryString.stringify({ id: value._id });

    const response = await orderAPI.cancelOrder(query);

    if (response.msg === "Thanh Cong") {
      setFilter({
        ...filter,
        change: !filter.change,
      });
    }
  };
  const columns = [
    {
      title: "Tên",
      dataIndex: "full_name",
      key: "full_name",
      width: "150px",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: "130px",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: "270px",
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "create_time",
      key: "create_time",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: "150px",
    },
    {
      title: "Thanh Toán",
      dataIndex: "pay",
      key: "pay",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, value) => {
        return (
          <div className="d-flex">
            <Link
              to={"/order/detail/" + value._id}
              className="btn btn-info mr-1"
            >
              Chi tiết
            </Link>

            <button
              type="button"
              style={{ cursor: "pointer", color: "white" }}
              onClick={() => handleConfirm(value)}
              className="btn btn-success mr-1"
            >
              Xác nhận
            </button>
            {!value.pay && (
              <button
                type="button"
                style={{ cursor: "pointer", color: "white" }}
                onClick={() => handleCancel(value)}
                className="btn btn-danger"
              >
                Hủy bỏ
              </button>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Xác nhận đơn hàng</h4>
                {/* {note ? <h5>{note}</h5> : <div></div>} */}
                <CustomTable
                  columns={columns}
                  dataSource={order}
                  totalPage={totalPage}
                  filter={filter}
                  setFilter={setFilter}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer text-center text-muted">
        All Rights Reserved by BULI. Designed and Developed by{" "}
        <a href="https://www.facebook.com/NguyenThanhHai.2k1">Hải Nguyễn</a>.
      </footer>
    </div>
  );
}

export default ConfirmOrder;
