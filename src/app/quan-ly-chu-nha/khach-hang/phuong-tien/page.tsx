"use client";

import React from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";

export default function PhuongTienPage(){
  return (
    <div className="p-6">
      <Panel title="Phương tiện">
        <p className="text-sm text-slate-600">Quản lý phương tiện liên quan đến khách (xe, đồ đạc,...).</p>
      </Panel>
    </div>
  );
}
