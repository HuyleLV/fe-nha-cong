"use client";

import { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import pointsService from "@/services/pointsService";
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tabs } from "antd";
import userService from "@/services/userService";

export default function PointManagerPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // For simplicity, we load users and then can click to view points or award points
    // Ideally this should be a proper user list with server-side pagination

    // Placeholder: implement basic manual adjustment
    const handleAdjust = async (values: any) => {
        try {
            await pointsService.adjustPoints({
                userId: values.userId,
                amount: values.amount,
                type: 'manual_adjust',
                description: values.description
            });
            message.success('Cập nhật điểm thành công');
            setIsModalOpen(false);
            form.resetFields();
        } catch (e: any) {
            message.error(e.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        // Load users for select
        loadUsers();
    };

    const loadUsers = async () => {
        try {
            const res = await userService.listAdminUsers({ page: 1, limit: 100 });
            // Check data structure, assuming it returns data array
            setUsers(Array.isArray(res) ? res : (res.data || []));
        } catch (e) { }
    };

    return (
        <div className="p-6">
            <Panel title="Quản lý Điểm Thưởng">
                <p className="mb-4 text-gray-600">Hệ thống điểm thưởng tự động. Bạn cũng có thể điều chỉnh thủ công tại đây.</p>

                <Button type="primary" onClick={handleOpenModal}>Cộng/Trừ Điểm Thủ Công</Button>

                {/* Future: Transaction Log Table for Host */}

                <Modal
                    title="Điều chỉnh điểm thủ công"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={() => form.submit()}
                >
                    <Form form={form} layout="vertical" onFinish={handleAdjust}>
                        <Form.Item name="userId" label="Khách hàng" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="label" options={users.map(u => ({ label: `${u.name} (${u.phone})`, value: u.id }))} />
                        </Form.Item>
                        <Form.Item name="amount" label="Số điểm (Dương để cộng, Âm để trừ)" rules={[{ required: true }]}>
                            <InputNumber className="w-full" />
                        </Form.Item>
                        <Form.Item name="description" label="Lý do" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>
            </Panel>
        </div>
    );
}
