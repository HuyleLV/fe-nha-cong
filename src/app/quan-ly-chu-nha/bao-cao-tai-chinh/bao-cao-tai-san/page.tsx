'use client';

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin } from 'antd';
import { ShopOutlined, DatabaseOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import financeService from '@/services/financeService';

export default function AssetReportPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await financeService.getAssets();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Báo Cáo Tài Sản</h1>
            <Spin spinning={loading}>
                <Row gutter={16} className="mb-6">
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng Số Tài Sản"
                                value={data?.totalAssets}
                                prefix={<DatabaseOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng Giá Trị"
                                value={data?.totalValue}
                                precision={0}
                                suffix="₫"
                                styles={{ content: { color: '#3f8600' } }}
                                prefix={<ShopOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <h3 className="text-lg font-semibold mb-4">Trạng Thái</h3>
                <Row gutter={16}>
                    {/* Assuming status strings like 'active', 'repair', 'broken' */}
                    <Col span={6}>
                        <Card>
                            <Statistic title="Đang Sử Dụng" value={data?.byStatus?.active || 0} prefix={<CheckCircleOutlined className="text-green-500" />} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Bảo Trì / Sửa Chữa" value={(data?.byStatus?.repair || 0) + (data?.byStatus?.maintenance || 0)} prefix={<WarningOutlined className="text-orange-500" />} />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
}
