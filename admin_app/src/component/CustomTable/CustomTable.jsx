import React from "react";
import { Pagination, Table } from "antd";

function CustomTable({ columns, dataSource, totalPage, setFilter, filter }) {
  return (
    <>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
      <div style={{ float: "right", marginTop: "30px" }}>
        <Pagination
          onChange={(e) => {
            setFilter({ ...filter, page: e });
          }}
          defaultCurrent={1}
          defaultPageSize={5}
          total={totalPage}
        />
      </div>
    </>
  );
}

export default CustomTable;
