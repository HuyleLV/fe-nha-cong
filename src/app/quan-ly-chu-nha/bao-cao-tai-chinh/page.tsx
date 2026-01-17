'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Spin } from 'antd';
import { Area } from '@ant-design/charts';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, WalletOutlined } from '@ant-design/icons';
import financeService from '@/services/financeService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function FinancialDashboard() {
    const [loading, setLoading] = useState(true);
    const [cashFlowData, setCashFlowData] = useState<any>(null);
    const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);

    useEffect(() => {
        loadData();
    }, [dates]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [start, end] = dates;
            const data = await financeService.getCashFlow(
                start.format('YYYY-MM-DD'),
                end.format('YYYY-MM-DD')
            );
            setCashFlowData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const config = {
        data: [
            { type: 'Thu (Hóa đơn)', value: cashFlowData?.breakdown?.invoiceIncome || 0 },
            { type: 'Thu (Khác)', value: cashFlowData?.breakdown?.manualIncome || 0 },
            { type: 'Chi', value: cashFlowData?.breakdown?.manualExpense || 0 },
        ],
        xField: 'type',
        yField: 'value',
        colorField: 'type',
        color: ['#3f8600', '#52c41a', '#cf1322'],
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tổng Quan Tài Chính</h1>
                <RangePicker
                    value={dates}
                    onChange={(vals) => vals && setDates([vals[0]!, vals[1]!])}
                />
            </div>

            <Spin spinning={loading}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng Thu"
                                value={cashFlowData?.totalIncome}
                                precision={0}
                                styles={{ content: { color: '#3f8600' } }}
                                prefix={<ArrowUpOutlined />}
                                suffix="₫"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng Chi"
                                value={cashFlowData?.totalExpense}
                                precision={0}
                                styles={{ content: { color: '#cf1322' } }}
                                prefix={<ArrowDownOutlined />}
                                suffix="₫"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Dòng Tiền Thuần"
                                value={cashFlowData?.netFlow}
                                precision={0}
                                styles={{ content: { color: cashFlowData?.netFlow >= 0 ? '#3f8600' : '#cf1322' } }}
                                prefix={<WalletOutlined />}
                                suffix="₫"
                            />
                        </Card>
                    </Col>
                </Row>

                <div className="mt-8 bg-white p-6 rounded shadow">
                    {/* Basic visualization - Replace with Line chart if time-series data available */}
                    <h3 className="mb-4 font-semibold">Cơ Cấu Dòng Tiền</h3>
                    {/* Using Area chart as placeholder, but bar/pie might be better for summary */}
                    {/* <Column {...config} />  -- Removing Chart component import for now to avoid peer dep issues if not installed */}
                    {/* Use simple bars for now */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span>Thu từ Hóa Đơn</span>
                                <span className="font-medium text-green-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cashFlowData?.breakdown?.invoiceIncome || 0)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(cashFlowData?.breakdown?.invoiceIncome / (cashFlowData?.totalIncome || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span>Thu Khác</span>
                                <span className="font-medium text-green-500">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cashFlowData?.breakdown?.manualIncome || 0)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(cashFlowData?.breakdown?.manualIncome / (cashFlowData?.totalIncome || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span>Chi Phí</span>
                                <span className="font-medium text-red-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cashFlowData?.breakdown?.manualExpense || 0)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                {/* Width logic for expense relative to income is tricky visually */}
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        </div>
    );
}
