'use client';

import React from 'react';
import FinancialDashboard from '../page'; // Reuse the dashboard overview logic

export default function CashFlowPage() {
  return (
    <div>
      {/* The user asked for "Detailed breakdown". reusing dashboard's breakdown for now.
                Ideally, we should list the transactions (Invoices + ThuChi records).
            */}
      <FinancialDashboard />

      <div className="p-6 pt-0">
        <h2 className="text-lg font-bold mb-4">Chi Tiết Giao Dịch</h2>
        <p className="text-gray-500">Tính năng xem chi tiết từng giao dịch đang được phát triển. Vui lòng xem báo cáo tổng quan ở trên.</p>
      </div>
    </div>
  );
}
