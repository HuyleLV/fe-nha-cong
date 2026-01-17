'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin } from 'antd';
import financeService from '@/services/financeService';
import dayjs from 'dayjs';

export default function DebtsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  useEffect(() => {
    loadData(1);
  }, []);

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const result = await financeService.getDebts(page, pagination.pageSize);
      setData(result.data);
      setPagination({ ...pagination, current: page, total: result.total });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã HĐ', dataIndex: 'id', key: 'id' },
    { title: 'Kỳ Thanh Toán', dataIndex: 'period', key: 'period' },
    {
      title: 'Hạn TT',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val))
    },
    {
      title: 'Đã Trả',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (val: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val))
    },
    {
      title: 'Còn Nợ',
      key: 'remaining',
      render: (_: any, record: any) => {
        const remaining = Number(record.totalAmount) - Number(record.paidAmount);
        return <span className="text-red-600 font-medium">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remaining)}
        </span>
      }
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'overdue' ? 'red' : 'orange';
        const text = status === 'overdue' ? 'Quá Hạn' : 'Chờ TT';
        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      }
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Danh Sách Khách Nợ Tiền</h1>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={Array.isArray(data) ? data : []}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => loadData(page)
          }}
        />
      </Spin>
    </div>
  );
}
