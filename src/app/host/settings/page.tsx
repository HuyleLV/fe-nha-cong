'use client';

import React, { useEffect, useState } from 'react';
import hostSettingsService, { HostSettings } from '@/services/hostSettingsService';
import { toast } from 'react-hot-toast';

export default function HostSettingsPage() {
    const [settings, setSettings] = useState<HostSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await hostSettingsService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch host settings:', error);
            toast.error('Không thể tải cài đặt.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        setSaving(true);
        try {
            await hostSettingsService.updateSettings(settings);
            toast.success('Cập nhật cài đặt thành công!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Lỗi khi lưu cài đặt.');
        } finally {
            setSaving(false);
        }
    };

    const handleNestedChange = (parentField: keyof HostSettings, childField: string, value: any) => {
        if (!settings) return;
        const parentObj = (settings[parentField] as any) || {};
        setSettings({
            ...settings,
            [parentField]: { ...parentObj, [childField]: value },
        });
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!settings) return <div className="p-8 text-center text-red-500">Lỗi tải dữ liệu.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold">Cài Đặt Chủ Nhà</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Settings */}
                <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông Tin Hiển Thị</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Hiển Thị</label>
                            <input
                                type="text"
                                value={settings.profile?.displayName || ''}
                                onChange={(e) => handleNestedChange('profile', 'displayName', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Tên sẽ hiển thị cho khách thuê"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại Công Khai</label>
                            <input
                                type="text"
                                value={settings.profile?.phone || ''}
                                onChange={(e) => handleNestedChange('profile', 'phone', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới Thiệu Ngắn</label>
                        <textarea
                            value={settings.profile?.bio || ''}
                            onChange={(e) => handleNestedChange('profile', 'bio', e.target.value)}
                            rows={3}
                            placeholder="Giới thiệu về bạn và các căn hộ của bạn..."
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </section>

                {/* Notification Settings */}
                <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông Báo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                                type="checkbox"
                                checked={settings.notifications?.email || false}
                                onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Email</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                                type="checkbox"
                                checked={settings.notifications?.bookingAlerts || false}
                                onChange={(e) => handleNestedChange('notifications', 'bookingAlerts', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Đặt lịch xem phòng</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                                type="checkbox"
                                checked={settings.notifications?.paymentAlerts || false}
                                onChange={(e) => handleNestedChange('notifications', 'paymentAlerts', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Thanh toán & Hóa đơn</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                                type="checkbox"
                                checked={settings.notifications?.contractAlerts || false}
                                onChange={(e) => handleNestedChange('notifications', 'contractAlerts', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Hợp đồng hết hạn</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input
                                type="checkbox"
                                checked={settings.notifications?.taskAlerts || false}
                                onChange={(e) => handleNestedChange('notifications', 'taskAlerts', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Công việc & Sự cố</span>
                        </label>
                    </div>
                </section>

                {/* Payment Info */}
                <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Tài Khoản Ngân Hàng (Nhận Tiền)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Ngân Hàng</label>
                            <input
                                type="text"
                                value={settings.payment?.bankName || ''}
                                onChange={(e) => handleNestedChange('payment', 'bankName', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số Tài Khoản</label>
                            <input
                                type="text"
                                value={settings.payment?.accountNumber || ''}
                                onChange={(e) => handleNestedChange('payment', 'accountNumber', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chủ Tài Khoản</label>
                            <input
                                type="text"
                                value={settings.payment?.accountHolder || ''}
                                onChange={(e) => handleNestedChange('payment', 'accountHolder', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chi Nhánh</label>
                            <input
                                type="text"
                                value={settings.payment?.bankBranch || ''}
                                onChange={(e) => handleNestedChange('payment', 'bankBranch', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}
