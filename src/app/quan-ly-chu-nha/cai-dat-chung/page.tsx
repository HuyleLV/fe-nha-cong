'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Tabs, Switch, Select, notification, Card, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined, BankOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import hostSettingsService, { HostSettings } from '@/services/hostSettingsService';
import userService, { UserProfile } from '@/services/userService';


const { Option } = Select;

export default function HostSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hostSettings, setHostSettings] = useState<HostSettings | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settings, profile] = await Promise.all([
        hostSettingsService.getSettings(),
        userService.getProfile()
      ]);
      setHostSettings(settings);
      setUserProfile(profile);
      form.setFieldsValue({
        ...settings,
        displayName: profile.name, // Map core user fields
        phone: profile.phone,
        email: profile.email
      });
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Lỗi tải dữ liệu cài đặt' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // 1. Update Core Profile
      await userService.updateProfile({
        name: values.displayName,
        // phone: values.phone // Phone update might require verification
      });

      // 2. Update Host Settings
      // Reconstruct nested objects from flat form values if needed, 
      // but Antd Form shouuld handle nested paths like ['payment', 'bankName'] if name="payment.bankName"

      // However, our state `hostSettings` has the structure.
      // Let's assume the form values match the structure OR we merge.

      // Antd form with nested names returns nested objects.
      // values: { displayName, phone, email, profile: {...}, payment: {...}, ... }

      // We need to separate Core Profile data from Host Settings data
      const settingsPayload: any = {
        profile: values.profile,
        payment: values.payment,
        notifications: values.notifications,
        preferences: values.preferences,
        storage: values.storage
      };

      await hostSettingsService.updateSettings(settingsPayload);
      notification.success({ message: 'Đã lưu cài đặt' });
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Lỗi khi lưu cài đặt' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (info: any) => {
    if (info.file.status === 'uploading') return;
    if (info.file.status === 'done') {
      // handled by customRequest or action
    }
    // Custom upload
    try {
      const res = await userService.uploadAvatar(info.file.originFileObj);
      setUserProfile(prev => prev ? ({ ...prev, avatarUrl: res.url }) : null);
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (e) {
      message.error('Lỗi upload ảnh');
    }
  };

  if (loading) return <div>Loading...</div>;

  const tabsItems = [
    {
      key: '1',
      label: <span><UserOutlined />Hồ Sơ</span>,
      children: (
        <Card title="Thông Tin Cá Nhân" className="mb-4">
          <div className="flex items-start gap-6">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-2 mx-auto">
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserOutlined className="text-4xl text-gray-400 mt-8" />
                )}
              </div>
              <Upload
                customRequest={({ file, onSuccess }) => {
                  handleAvatarUpload({ file: { originFileObj: file, status: 'done' } });
                  onSuccess?.("ok");
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Đổi Ảnh</Button>
              </Upload>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="Tên Hiển Thị" name="displayName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Số Điện Thoại" name="phone">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Giới Thiệu (Bio)" name={['profile', 'bio']}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </div>
          </div>
        </Card>
      )
    },
    {
      key: '2',
      label: <span><BankOutlined />Tài Chính</span>,
      children: (
        <Card title="Tài Khoản Ngân Hàng (Mặc định)" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Tên Ngân Hàng" name={['payment', 'bankName']}>
              <Input placeholder="VD: Vietcombank" />
            </Form.Item>
            <Form.Item label="Chi Nhánh" name={['payment', 'bankBranch']}>
              <Input placeholder="VD: CN Hoàn Kiếm" />
            </Form.Item>
            <Form.Item label="Số Tài Khoản" name={['payment', 'accountNumber']}>
              <Input />
            </Form.Item>
            <Form.Item label="Tên Chủ Tài Khoản" name={['payment', 'accountHolder']}>
              <Input />
            </Form.Item>
          </div>
          <div className="bg-yellow-50 p-3 border border-yellow-200 rounded text-yellow-700 text-sm">
            Lưu ý: Hiện tại hệ thống chỉ hỗ trợ 1 tài khoản ngân hàng mặc định để nhận tiền tự động.
          </div>
        </Card>
      )
    },
    {
      key: '3',
      label: <span><BellOutlined />Thông Báo</span>,
      children: (
        <Card className="mb-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span>Gửi Email</span>
              <Form.Item name={['notifications', 'email']} valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span>Gửi Tin Nhắn (SMS)</span>
              <Form.Item name={['notifications', 'sms']} valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span>Thông Báo Đẩy (App)</span>
              <Form.Item name={['notifications', 'push']} valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            <h3 className="font-semibold mt-4">Loại Thông Báo</h3>
            <div className="flex justify-between items-center">
              <span>Đặt Phòng Mới</span>
              <Form.Item name={['notifications', 'bookingAlerts']} valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
            <div className="flex justify-between items-center">
              <span>Thanh Toán Hóa Đơn</span>
              <Form.Item name={['notifications', 'paymentAlerts']} valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Card>
      )
    },
    {
      key: '4',
      label: <span><SettingOutlined />Cấu Hình Khác</span>,
      children: (
        <Card className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Ngôn Ngữ" name={['preferences', 'language']}>
              <Select>
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">English</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Múi Giờ" name={['preferences', 'timezone']}>
              <Select>
                <Option value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</Option>
                {/* Add more */}
              </Select>
            </Form.Item>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cài Đặt Chủ Nhà</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={hostSettings || {}}
      >
        <div className="flex justify-end mb-4">
          <Button type="primary" htmlType="submit" loading={saving}>
            Lưu Thay Đổi
          </Button>
        </div>

        <Tabs defaultActiveKey="1" type="card" items={tabsItems} />
      </Form>
    </div>
  );
}
