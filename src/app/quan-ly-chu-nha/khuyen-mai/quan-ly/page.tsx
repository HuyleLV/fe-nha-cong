"use client";

import { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel"; // Correct path if needed
import promotionsService from "@/services/promotionsService";
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Switch, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function PromotionManagerPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await promotionsService.findAll();
            setItems(res || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreate = async (values: any) => {
        try {
            const payload = {
                ...values,
                startDate: values.startDate ? values.startDate.toDate() : null,
                endDate: values.endDate ? values.endDate.toDate() : null,
            };
            await promotionsService.create(payload);
            message.success("Tạo mã khuyến mãi thành công");
            setIsModalOpen(false);
            form.resetFields();
            loadData();
        } catch (e: any) {
            message.error(e.response?.data?.message || "Tạo thất bại");
        }
    };

    const columns = [
        { title: "Mã", dataIndex: "code", key: "code" },
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        { title: "Loại", dataIndex: "type", key: "type", render: (t: string) => t === 'percent' ? '%' : 'VND' },
        { title: "Giá trị", dataIndex: "value", key: "value", render: (v: number) => new Intl.NumberFormat('vi-VN').format(v) },
        { title: "Hạn dùng", dataIndex: "endDate", key: "endDate", render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : 'Vô thời hạn' },
        { title: "Lượt dùng", dataIndex: "usedCount", key: "usedCount" },
        { title: "Trạng thái", dataIndex: "active", key: "active", render: (act: boolean) => act ? <span className="text-green-600">Active</span> : <span className="text-gray-400">Inactive</span> },
    ];

    return (
        <div className="p-6">
            <Panel title="Quản lý Khuyến Mãi">
                <div className="mb-4 flex justify-end">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Tạo mã mới
                    </Button>
                </div>
                <Table dataSource={items} columns={columns} rowKey="id" loading={loading} />

                <Modal
                    title="Tạo mã khuyến mãi mới"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                >
                    <Form form={form} layout="vertical" onFinish={handleCreate}>
                        <Form.Item name="code" label="Mã khuyến mãi" rules={[{ required: true, message: 'Nhập mã' }]}>
                            <Input placeholder="VD: SUMMER2024" />
                        </Form.Item>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                            <Input placeholder="VD: Giảm giá mùa hè" />
                        </Form.Item>
                        <Form.Item name="description" label="Mô tả">
                            <Input.TextArea />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="type" label="Loại giảm" initialValue="fixed">
                                <Select options={[{ value: 'fixed', label: 'Số tiền cố định' }, { value: 'percent', label: 'Phần trăm' }]} />
                            </Form.Item>
                            <Form.Item name="value" label="Giá trị" rules={[{ required: true }]}>
                                <InputNumber className="w-full" />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="startDate" label="Ngày bắt đầu">
                                <DatePicker className="w-full" showTime />
                            </Form.Item>
                            <Form.Item name="endDate" label="Ngày kết thúc">
                                <DatePicker className="w-full" showTime />
                            </Form.Item>
                        </div>
                        <Form.Item name="maxUses" label="Giới hạn lượt dùng">
                            <InputNumber className="w-full" placeholder="Để trống nếu không giới hạn" />
                        </Form.Item>
                        <Form.Item name="active" label="Kích hoạt ngay" valuePropName="checked" initialValue={true}>
                            <Switch />
                        </Form.Item>
                    </Form>
                </Modal>
            </Panel>
        </div>
    );
}
