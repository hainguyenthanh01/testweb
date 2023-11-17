import React, { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { BiSolidDiscount   } from "react-icons/bi";
import { FaUserCircle, FaUser } from "react-icons/fa";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { HiShoppingCart } from "react-icons/hi";
import { ImFire } from "react-icons/im";
import { BiSolidCategory } from "react-icons/bi";
import { GiStabbedNote } from "react-icons/gi";
import { ImTruck } from "react-icons/im";
import { FiUsers } from "react-icons/fi";
import { FaUserGroup } from "react-icons/fa6";


import { Route, Switch, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import User from "../User/User";
import UserCus from "../UserCus/UserCus";
import Product from "../Product/Product";
import Coupon from "../Conpon/Coupon";
import Sale from "../Sale/Sale";
import Category from "../Category/Category";
import Order from "../Order/Order";
import ConfirmOrder from "../Order/ConfirmOrder";
import CompletedOrder from "../Order/CompletedOrder";
import CancelOrder from "../Order/CancelOrder";
import ConfirmDelivery from "../Order/ConfirmDelivery";
import Delivery from "../Order/Delivery";
import Permission from "../Permission/Permission";
import CreateProduct from '../Product/CreateProduct'
import UpdateProduct from '../Product/UpdateProduct'
import CreateCategory from '../Category/CreateCategory'
import DetailCategory from '../Category/DetailCategory'
import UpdateCategory from '../Category/UpdateCategory'
import CreatePermission from '../Permission/CreatePermission'
import UpdatePermission from '../Permission/UpdatePermission'
import CreateUser from '../User/CreateUser'
import UpdateUser from '../User/UpdateUser'
import CreateUserCus from '../UserCus/CreateUserCus'
import UpdateUserCus from '../UserCus/UpdateUserCus'
import DetailOrder from '../Order/DetailOrder'
import Login from '../Login/Login';
import NotFound from '../NotFound/NotFound';
import CreateCoupon from '../Conpon/CreateCoupon';
import UpdateCoupon from '../Conpon/UpdateCoupon';
import CreateSale from '../Sale/CreateSale';
import UpdateSale from '../Sale/UpdateSale';
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, link, children) {
  return {
    key,
    icon,
    children,
    label,
    link,
  };
}

const items = [
  getItem("Customer", "1", <FaUserCircle />, "/customer"),
  getItem("Coupon ", "2", <BiSolidDiscount/>, "/coupon"),
  getItem("Product ", "3", <HiShoppingCart />, "/product"),
  getItem("Sale ", "4", <ImFire />, "/sale"),
  getItem("Category ", "5", <BiSolidCategory  />, "/category"),
  getItem("Order ", "6", <GiStabbedNote  />, "/order", [
    getItem("Order", "children_oder_1", null, "/order"),
    getItem("ConfirmOrder", "children_oder_2", null, "/confirmorder"),
    getItem("CompletedOrder", "children_oder_3", null, "/completedorder"),
    getItem("CancelOrder", "children_oder_4", null, "/cancelorder"),
  ]),
  getItem("Delivery ", "7", <ImTruck/>, "/delivery", [
    getItem("Delivery", "children_delivery_1", null, "/delivery"),
    getItem("ConfirmDelivery", "children_delivery_2", null, "/confirmdelivery"),
  ]),
  getItem("User", "sub1", <FaUser />, "/user"),

  getItem("Permission", "sub2", <FaUserGroup  />, "/permission"),
];
const LeftMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        collapsible
        style={{ marginTop: "80px" }}
        collapsedWidth={80}
        width={260}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          onSelect={({ item, key }) => {
            history.push(item.props.link);
          }}
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        />
        <Content
          style={{
            margin: "0 16px",
          }}
        >
            {/* {getComponentByKey(key)} */}

            <Switch>
            <Route exact path='/' component={Login} />

            <Route exact path='/customer' component={UserCus} />
            <Route path='/customer/create' component={CreateUserCus} />
            <Route path='/customer/update/:id' component={UpdateUserCus} />


            <Route exact path='/product' component={Product} />
            <Route path='/product/create' component={CreateProduct} />
            <Route path='/product/update/:id' component={UpdateProduct} />

            <Route exact path='/category' component={Category} />
            <Route path='/category/create' component={CreateCategory} />
            <Route path='/category/update/:id' component={UpdateCategory} />
            <Route path='/category/:id' component={DetailCategory} />


            <Route exact path='/permission' component={Permission} />
            <Route path='/permission/create' component={CreatePermission} />
            <Route path='/permission/update/:id' component={UpdatePermission} />

            <Route exact path='/user' component={User} />
            <Route path='/user/create' component={CreateUser} />
            <Route path='/user/update/:id' component={UpdateUser} />

            <Route exact path='/order' component={Order} />
            <Route path='/order/detail/:id' component={DetailOrder} />
            <Route path='/confirmorder' component={ConfirmOrder} />
            <Route path='/delivery' component={Delivery} />
            <Route path='/confirmdelivery' component={ConfirmDelivery} />
            <Route path='/completedorder' component={CompletedOrder} />
            <Route path='/cancelorder' component={CancelOrder} />

            <Route exact path='/coupon' component={Coupon} />
            <Route path='/coupon/create' component={CreateCoupon} />
            <Route path='/coupon/:id' component={UpdateCoupon} />

            <Route exact path='/sale' component={Sale} />
            <Route path='/sale/create' component={CreateSale} />
            <Route path='/sale/:id' component={UpdateSale} />

            <Route component={NotFound} />
          </Switch>;

        </Content>
      </Layout>
    </Layout>
  );
};
export default LeftMenu;