type Props = {
    filters: any;
    setFilters: (f: any) => void;
  };
  
  export default function FilterSidebar({ filters, setFilters }: Props) {
    return (
      <div className="bg-white rounded-xl shadow p-4 border border-green-200">
        <h2 className="text-lg font-bold text-green-800 mb-4">Bộ lọc</h2>
  
        <div className="space-y-3">
          <details className="group">
            <summary className="cursor-pointer font-semibold">Khu vực</summary>
            <div className="mt-2 space-y-2 pl-2">
              <label className="block">
                <input type="checkbox" className="mr-2" /> Cầu Giấy
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> Thanh Xuân
              </label>
            </div>
          </details>
  
          <details>
            <summary className="cursor-pointer font-semibold">Giá</summary>
            <div className="mt-2 pl-2 space-y-2">
              <label className="block">
                <input type="radio" name="gia" className="mr-2" /> Dưới 3 triệu
              </label>
              <label className="block">
                <input type="radio" name="gia" className="mr-2" /> 3 - 6 triệu
              </label>
            </div>
          </details>
  
          <details>
            <summary className="cursor-pointer font-semibold">Loại phòng</summary>
            <div className="mt-2 pl-2 space-y-2">
              <label className="block">
                <input type="checkbox" className="mr-2" /> Chung cư mini
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> Phòng trọ
              </label>
            </div>
          </details>
        </div>
  
        <button className="w-full mt-6 bg-gradient-to-r from-[#006633] to-[#4CAF50] text-white py-2 rounded-lg font-semibold hover:opacity-90">
          Áp dụng
        </button>
      </div>
    );
  }
  