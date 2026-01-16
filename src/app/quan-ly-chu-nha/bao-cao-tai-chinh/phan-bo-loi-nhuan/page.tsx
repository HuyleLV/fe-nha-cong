'use client';

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Select, Table, Spin } from 'antd';
import financeService from '@/services/financeService';

const { Option } = Select;

export default function ProfitLossPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await financeService.getProfitLoss(year);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Hạng Mục', dataIndex: 'item', key: 'item' },
    {
      title: 'Giá Trị',
      dataIndex: 'value',
      key: 'value',
      render: (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    },
  ];

  const tableData = [
    { key: '1', item: 'Doanh Thu (Hóa đơn đã phát hành)', value: data?.revenue || 0 },
    { key: '2', item: 'Chi Phí Vận Hành', value: data?.expense || 0 },
    { key: '3', item: 'Lợi Nhuận Trước Thuế', value: data?.profit || 0 },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo Cáo Lợi Nhuận</h1>
        <Select value={year} onChange={setYear} style={{ width: 120 }}>
          <Option value={2024}>2024</Option>
          <Option value={2025}>2025</Option>
          <Option value={2026}>2026</Option>
        </Select>
      </div>

      <Spin spinning={loading}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <Statistic title="Doanh Thu" value={data?.revenue} precision={0} suffix="₫" styles={{ content: { color: '#3f8600' } }} />
          </Card>
          <Card>
            <Statistic title="Chi Phí" value={data?.expense} precision={0} suffix="₫" styles={{ content: { color: '#cf1322' } }} />
          </Card>
          <Card>
            <Statistic title="Lợi Nhuận" value={data?.profit} precision={0} suffix="₫" styles={{ content: { color: data?.profit >= 0 ? '#3f8600' : '#cf1322' } }} />
          </Card>
        </div>

        <Card title="Chi Tiết">
          <Table columns={columns} dataSource={tableData} pagination={false} />
        </Card>
      </Spin>
    </div>
  );
}
