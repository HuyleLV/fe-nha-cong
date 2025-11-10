// Centralized Vietnamese translation helpers for Admin UI
export const viAdmin = {
  actions: {
    reload: 'Tải lại',
    addUser: 'Thêm người dùng',
    addJob: 'Thêm tin',
    addLocation: 'Thêm khu vực',
    edit: 'Sửa',
    delete: 'Xoá',
    view: 'Xem',
    save: 'Lưu',
    create: 'Tạo mới',
    update: 'Cập nhật',
    cancel: 'Huỷ'
  },
  buildingStatus: {
    active: 'Hoạt động',
    inactive: 'Ngừng hoạt động',
    draft: 'Nháp'
  },
  role: {
    admin: 'Quản trị',
    owner: 'Chủ nhà',
    user: 'Người dùng'
  },
  locationLevels: {
    Province: 'Tỉnh',
    City: 'Thành phố',
    District: 'Quận'
  },
  jobStatus: {
    published: 'Công khai',
    draft: 'Nháp',
    archived: 'Lưu trữ'
  },
  apartmentStatus: {
    published: 'Công khai',
    draft: 'Nháp',
    archived: 'Lưu trữ'
  },
  viewingStatus: {
    pending: 'Đang chờ',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã huỷ',
    visited: 'Đã xem'
  }
};

export const tRole = (r: string) => viAdmin.role[r as keyof typeof viAdmin.role] || r;
export const tLocationLevel = (lv: string) => (viAdmin.locationLevels as any)[lv] || lv;
export const tJobStatus = (st: string) => (viAdmin.jobStatus as any)[st] || st;
export const tViewingStatus = (st: string) => (viAdmin.viewingStatus as any)[st] || st;
export const tBuildingStatus = (st: string) => (viAdmin.buildingStatus as any)[st] || st;
export const tApartmentStatus = (st: string) => (viAdmin.apartmentStatus as any)[st] || st;
