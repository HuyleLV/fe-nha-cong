"use client";

import { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import promotionsService from "@/services/promotionsService";
import { Tag, Card, Row, Col, Spin, Empty } from "antd";
import { GiftOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function KhuyenMaiPage() {
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await promotionsService.findActive();
      setPromotions(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Panel title="Khuyến mãi & Ưu đãi">
        <p className="text-gray-600 mb-6">Các chương trình khuyến mãi hiện có dành cho bạn.</p>

        <Spin spinning={loading}>
          {promotions.length === 0 ? (
            <Empty description="Hiện chưa có chương trình khuyến mãi nào" />
          ) : (
            <Row gutter={[16, 16]}>
              {promotions.map((promo) => (
                <Col xs={24} md={12} lg={8} key={promo.id}>
                  <Card
                    className="h-full shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700"
                    actions={[
                      <div key="code" className="text-emerald-600 font-bold copy-cursor" onClick={() => { navigator.clipboard.writeText(promo.code); alert('Đã sao chép mã!') }}>
                        {promo.code} (Sao chép)
                      </div>
                    ]}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Tag color="cyan">{promo.type === 'percent' ? `Giảm ${promo.value}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(promo.value)}₫`}</Tag>
                    </div>
                    <h3 className="text-lg font-bold mb-2 dark:text-white">{promo.title}</h3>
                    <p className="text-gray-500 mb-4 line-clamp-2 dark:text-gray-400">{promo.description}</p>

                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <ClockCircleOutlined /> Hết hạn: {promo.endDate ? dayjs(promo.endDate).format('DD/MM/YYYY') : 'Vô thời hạn'}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      </Panel>
    </div>
  );
}
