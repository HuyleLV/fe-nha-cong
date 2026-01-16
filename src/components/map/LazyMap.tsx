import dynamic from "next/dynamic";
import { forwardRef } from "react";
import { PropertyMapHandle } from "./PropertyMap";

const DynamicPropertyMap = dynamic(() => import("./PropertyMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
            <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                Đang tải bản đồ...
            </div>
        </div>
    ),
});

const LazyMap = forwardRef<PropertyMapHandle, any>((props, ref) => {
    return <DynamicPropertyMap {...props} ref={ref} />;
});

LazyMap.displayName = "LazyMap";
export default LazyMap;
