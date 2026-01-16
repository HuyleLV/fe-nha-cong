'use client';

import React, { useEffect, useState } from 'react';
import systemSettingsService, { SystemSettings } from '@/services/systemSettingsService';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await systemSettingsService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Không thể tải cài đặt hệ thống.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        setSaving(true);
        try {
            await systemSettingsService.updateSettings(settings); // Send the whole object as partial DTO
            toast.success('Cập nhật cài đặt thành công!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Lỗi khi lưu cài đặt.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof SystemSettings, value: any) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    const handleNestedChange = (parentField: keyof SystemSettings, childField: string, value: any) => {
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
                <h1 className="text-2xl font-bold">Cài Đặt Hệ Thống</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* General Info */}
                <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông Tin Chung</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Website</label>
                            <input
                                type="text"
                                value={settings.siteTitle || ''}
                                onChange={(e) => handleChange('siteTitle', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Website</label>
                            <input
                                type="text"
                                value={settings.siteDescription || ''}
                                onChange={(e) => handleChange('siteDescription', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Liên Hệ</label>
                            <input
                                type="email"
                                value={settings.contactEmail || ''}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                            <input
                                type="text"
                                value={settings.contactPhone || ''}
                                onChange={(e) => handleChange('contactPhone', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa Chỉ</label>
                        <textarea
                            value={settings.contactAddress || ''}
                            onChange={(e) => handleChange('contactAddress', e.target.value)}
                            rows={3}
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </section>

                {/* Feature Flags */}
                <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Tính Năng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.features?.enableRegistration || false}
                                onChange={(e) => handleNestedChange('features', 'enableRegistration', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Cho phép đăng ký</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.features?.enableGoogleLogin || false}
                                onChange={(e) => handleNestedChange('features', 'enableGoogleLogin', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Đăng nhập Google</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.features?.enableMaintenanceMode || false}
                                onChange={(e) => handleNestedChange('features', 'enableMaintenanceMode', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-red-600 rounded focus:ring-red-500"
                            />
                            <span className="text-gray-700 font-medium text-red-600">Chế độ bảo trì (Maintenance Mode)</span>
                        </label>
                    </div>
                    {settings.features?.enableMaintenanceMode && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thông báo bảo trì</label>
                            <input
                                type="text"
                                value={settings.maintenanceMessage || ''}
                                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                placeholder="Hệ thống đang bảo trì, vui lòng quay lại sau."
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}
                </section>

                {/* Storage Config (Simplified View) */}
                <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Lưu Trữ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại Lưu Trữ</label>
                            <select
                                value={settings.storageType}
                                onChange={(e) => handleChange('storageType', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="local">Local (Trên máy chủ)</option>
                                <option value="s3">AWS S3</option>
                                <option value="spaces">DigitalOcean Spaces</option>
                                <option value="ftp">FTP</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        * Cấu hình chi tiết (Access Key, Secret, Bucket...) vui lòng chỉnh sửa trực tiếp trong database hoặc file .env nếu chưa hỗ trợ UI đầy đủ.
                    </p>
                </section>
            </form>
        </div>
    );
}
