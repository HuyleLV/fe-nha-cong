import ViewedRoomsPage from "@/features/phong-quan-tam";

export const metadata = {
  title: "Phòng quan tâm",
  description: "Những phòng bạn đã xem gần đây",
  icons: { icon: "/logo.png" },
};

export default function Page() {
  return <ViewedRoomsPage />;
}
