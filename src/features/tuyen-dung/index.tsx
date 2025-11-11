"use client";
import React from 'react';
import { Briefcase, Search, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { jobService } from '@/services/jobService';
import { Job } from '@/type/job';
import JobCard from '@/components/JobCard';

export default function JobsFeatureIndex() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [loading, setLoading] = React.useState(false);
	const [jobs, setJobs] = React.useState<Job[]>([]);
	const [meta, setMeta] = React.useState<{ total: number; page: number; limit: number; totalPages: number }>({ total: 0, page: 1, limit: 12, totalPages: 1 });
	const [page, setPage] = React.useState<number>(Number(searchParams.get('page') || 1));
	const [limit] = React.useState<number>(12);
	const [q, setQ] = React.useState<string>(searchParams.get('q') || '');

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		try {
			const res = await jobService.list({ page, limit, q });
			setJobs(res.items);
			setMeta(res.meta);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, [page, limit, q]);

	React.useEffect(() => { fetchData(); }, [fetchData]);

	const totalPages = meta.totalPages || Math.max(1, Math.ceil(meta.total / limit));

	const onSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams();
		if (q) params.set('q', q);
		params.set('page', '1');
		router.push(`/tuyen-dung?${params.toString()}`);
		setPage(1);
		fetchData();
	};

	const changePage = (p: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', String(p));
		router.push(`/tuyen-dung?${params.toString()}`);
		setPage(p);
	};

	return (
		<div className="mx-auto max-w-screen-2xl py-10">
			{/* Hero */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-10 mb-8 text-white">
				<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_60%)]" />
				<div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
					<div className="flex-1 space-y-3">
						<h1 className="text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
							<Briefcase className="w-10 h-10" /> Cơ hội nghề nghiệp
						</h1>
						<p className="text-emerald-50 max-w-2xl text-sm lg:text-base leading-relaxed">
							Khám phá các vị trí đang mở và cùng xây dựng sản phẩm nhà trọ thông minh. Chúng tôi tìm kiếm những con người ham học hỏi, chủ động và yêu thích tối ưu trải nghiệm.
						</p>
					</div>
					<div className="w-full max-w-md">
						<form onSubmit={onSearch} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 flex flex-col gap-3">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
								<input
									value={q}
									onChange={(e) => setQ(e.target.value)}
									placeholder="Tìm vị trí, kỹ năng..."
									className="w-full rounded-lg bg-white/15 border border-white/30 pl-11 pr-3 py-2 text-sm placeholder:text-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/70"
								/>
							</div>
							<div className="flex gap-2 justify-end">
								<button
									type="submit"
									className="px-4 py-2 rounded-lg bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition"
								>
									Tìm kiếm
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="px-4">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
					</div>
				) : jobs.length === 0 ? (
					<div className="py-16 text-center border border-dashed border-slate-300 rounded-xl">
						<p className="text-slate-600 text-sm">Chưa có vị trí phù hợp. Thử từ khóa khác hoặc quay lại sau.</p>
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{jobs.map((job) => (
							<JobCard key={job.id} job={job} />
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="mt-10 flex flex-col items-center gap-4">
						<div className="flex items-center gap-2 text-sm font-medium">
							<span>Trang</span>
							<span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700">{page}</span>
							<span className="text-slate-500">/ {totalPages}</span>
						</div>
						<div className="flex gap-2">
							<button
								aria-label="Trang trước"
								disabled={page <= 1}
								onClick={() => changePage(page - 1)}
								className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 disabled:opacity-40"
							>
								Trước
							</button>
							<button
								aria-label="Trang sau"
								disabled={page >= totalPages}
								onClick={() => changePage(page + 1)}
								className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 disabled:opacity-40"
							>
								Sau
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export { JobCard };
