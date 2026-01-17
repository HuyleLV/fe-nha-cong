"use client";

import { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import offersService from "@/services/offersService";
import { Card, Row, Col, Spin, Empty, Button, Modal } from "antd";
import { ShopOutlined } from "@ant-design/icons";

export default function UuDaiPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await offersService.findActive();
      setOffers(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Panel title="Ưu đãi từ đối tác">
        <p className="text-gray-600 mb-6">Các ưu đãi độc quyền dành cho cư dân NhàCộng.</p>

        <Spin spinning={loading}>
          {offers.length === 0 ? (
            <Empty description="Hiện chưa có ưu đãi nào" />
          ) : (
            <Row gutter={[24, 24]}>
              {offers.map((offer) => (
                <Col xs={24} sm={12} md={8} xl={6} key={offer.id}>
                  <Card
                    hoverable
                    cover={<div className="h-40 bg-gray-200 bg-center bg-cover" style={{ backgroundImage: `url(${offer.image || '/images/placeholder-offer.jpg'})` }} />}
                    className="h-full flex flex-col dark:bg-slate-800 dark:border-slate-700"
                    onClick={() => setPreview(offer)}
                  >
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                      <ShopOutlined /> <span className="text-sm font-semibold">{offer.partner_name}</span>
                    </div>
                    <h3 className="text-base font-bold mb-2 line-clamp-1 dark:text-white">{offer.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 dark:text-gray-400">{offer.description}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        <Modal
          title={preview?.title}
          open={!!preview}
          onCancel={() => setPreview(null)}
          footer={[<Button key="close" onClick={() => setPreview(null)}>Đóng</Button>]}
          width={700}
        >
          {preview && (
            <div>
              <div className="w-full h-60 bg-gray-200 bg-center bg-cover rounded-lg mb-4" style={{ backgroundImage: `url(${preview.image || '/images/placeholder-offer.jpg'})` }} />
              <h4 className="font-bold text-lg mb-2 text-emerald-600">{preview.partner_name}</h4>
              <p className="text-gray-700 text-base mb-4 bg-gray-50 p-3 rounded">{preview.description}</p>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: preview.content || '' }} />
            </div>
          )}
        </Modal>
      </Panel>
    </div>
  );
}
