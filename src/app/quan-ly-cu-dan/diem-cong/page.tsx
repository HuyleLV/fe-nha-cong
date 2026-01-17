"use client";

import { useEffect, useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import pointsService from "@/services/pointsService";
import { Card, Statistic, Table, Tag } from "antd";
import { TrophyOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function DiemCongPage() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balRes, histRes] = await Promise.all([
        pointsService.getMyBalance(),
        pointsService.getMyHistory(1, 20)
      ]);
      setBalance(balRes.balance || 0);
      setHistory(histRes.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm') },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: 'Nội dung', dataIndex: 'description', key: 'description' },
    {
      title: 'Số điểm',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => (
        <span className={val > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
          {val > 0 ? '+' : ''}{val}
        </span>
      )
    },
  ];

  return (
    <div className="p-6">
      <Panel title="Điểm thưởng & Ví">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700">
            <Statistic
              title={<span className="text-orange-600 font-semibold flex items-center gap-2"><TrophyOutlined /> Điểm tích lũy</span>}
              value={balance}
              precision={0}
              styles={{ content: { color: '#d97706', fontWeight: 'bold' } }}
            />
            <div className="mt-2 text-xs text-gray-500">Dùng điểm để đổi ưu đãi hoặc trừ vào tiền nhà</div>
          </Card>
        </div>

        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><HistoryOutlined /> Lịch sử giao dịch</h3>
        <Table
          dataSource={history}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Panel>
    </div>
  );
}
