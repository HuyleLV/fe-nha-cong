"use client";

import { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import offersService from "@/services/offersService";
import { Table, Button, Modal, Form, Input, Switch, message, Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axiosClient from "@/utils/axiosClient";

export default function OfferManagerPage() {
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
            const res = await offersService.findAll();
            setItems(res || []);
        } catch (e) { } finally { setLoading(false); }
    };

    const handleCreate = async (values: any) => {
        try {
            // Upload image logic omitted for brevity, assuming simple text URL for now or implementation elsewhere
            // But for completeness, let's just save the text url
            await offersService.create(values);
            message.success("Tạo ưu đãi thành công");
            setIsModalOpen(false);
            form.resetFields();
            loadData();
        } catch (e) {
            message.error("Tạo thất bại");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa?')) return;
        try {
            await offersService.remove(id);
            loadData();
            message.success('Đã xóa');
        } catch (e) { message.error('Xóa thất bại'); }
    };

    const columns = [
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        { title: "Đối tác", dataIndex: "partner_name", key: "partner_name" },
        { title: "Ảnh", dataIndex: "image", key: "image", render: (url: string) => url ? <img src={url} className="h-10 w-10 object-cover rounded" /> : '-' },
        { title: "Trạng thái", dataIndex: "active", key: "active", render: (act: boolean) => act ? "Active" : "Inactive" },
        {
            title: "Thao tác", key: "action",
            render: (_: any, record: any) => (
                <Button danger size="small" onClick={() => handleDelete(record.id)}>Xóa</Button>
            )
        },
    ];

    return (
        <div className="p-6">
            <Panel title="Quản lý Ưu Đãi Đối Tác">
                <div className="mb-4 flex justify-end">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Thêm ưu đãi
                    </Button>
                </div>
                <Table dataSource={items} columns={columns} rowKey="id" loading={loading} />

                <Modal
                    title="Thêm ưu đãi mới"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                >
                    <Form form={form} layout="vertical" onFinish={handleCreate}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="partner_name" label="Tên đối tác" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="image" label="URL Ảnh (Logo/Banner)">
                            <Input placeholder="https://..." />
                        </Form.Item>
                        <Form.Item name="description" label="Mô tả ngắn">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item name="content" label="Nội dung chi tiết (HTML)">
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item name="active" label="Kích hoạt" valuePropName="checked" initialValue={true}>
                            <Switch />
                        </Form.Item>
                    </Form>
                </Modal>
            </Panel>
        </div>
    );
}
