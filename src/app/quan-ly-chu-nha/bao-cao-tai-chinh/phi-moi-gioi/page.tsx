'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin } from 'antd';
import financeService from '@/services/financeService';

export default function BrokerageFeesPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    useEffect(() => {
        loadData(1);
    }, []);

    const loadData = async (page: number) => {
        setLoading(true);
        try {
            const result = await financeService.getBrokerage(page, pagination.pageSize);
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
        { title: 'Người Tạo', dataIndex: 'createdBy', key: 'createdBy' }, // Should probably map to name
        {
            title: 'Phí Môi Giới',
            dataIndex: 'commissionAmount',
            key: 'commissionAmount',
            render: (val: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val))
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'commissionStatus',
            key: 'commissionStatus',
            render: (status: string) => {
                const color = status === 'paid' ? 'green' : 'orange';
                const text = status === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán';
                return <Tag color={color}>{text.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Ngày Ký',
            dataIndex: 'signDate',
            key: 'signDate',
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Phí Môi Giới</h1>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={data}
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
