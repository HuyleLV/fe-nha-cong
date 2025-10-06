const rooms = [
    {
      id: 1,
      title: "Trọ Lê Quý Đôn siêu đẹp, tiện ích khu cao cấp",
      price: "6,500,000",
      address: "Phường Bạch Đằng, Hai Bà Trưng, Hà Nội",
      available: 0,
      img: "https://picsum.photos/400/250?1",
    },
    {
      id: 2,
      title: "CCMN khu Thanh Xuân - Full nội thất",
      price: "6,200,000",
      address: "Phường Nhân Chính, Thanh Xuân, Hà Nội",
      available: 5,
      img: "https://picsum.photos/400/250?2",
    },
    {
      id: 3,
      title: "Phòng full đồ, thoáng mát tại P. Mai Dịch",
      price: "7,000,000",
      address: "Phường Mai Dịch, Cầu Giấy, Hà Nội",
      available: 2,
      img: "https://picsum.photos/400/250?3",
    },
  ];
  
  export default function RoomCartVertical({ filters }: { filters: any }) {
    return (
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-4">Kết quả</h2>
        <div className="space-y-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white border border-green-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <img src={room.img} alt={room.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg text-green-900">{room.title}</h3>
                <p className="text-red-600 font-semibold mt-1">Từ {room.price}/tháng</p>
                <p className="text-gray-600 text-sm">{room.address}</p>
                <p className="text-gray-500 text-xs">Còn trống: {room.available} phòng</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  