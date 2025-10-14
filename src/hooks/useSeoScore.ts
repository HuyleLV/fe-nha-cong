import { SeoCheck, SeoScoreResult } from "@/type/seo";

// ---- helpers ----
const stripHtml = (html: string) =>
    (html || '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const wordCountFromHtml = (html: string) => {
    const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return (text.match(/\b[\p{L}\p{N}'’-]+\b/gu) || []).length;
};

const normalizeVi = (s: string) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const toSlug = (s: string) =>
    normalizeVi(s).replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const countOccurrences = (text: string, kw: string) => {
    const t = normalizeVi(text);
    const k = normalizeVi(kw).trim();
    if (!k) return 0;
    const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    return (t.match(re) || []).length;
};

const avgSentenceLength = (text: string) => {
    const sentences = (text || '').split(/[.!?…]+/g).map(s => s.trim()).filter(Boolean);
    const words = sentences.reduce((acc, s) => acc + s.split(/\s+/).filter(Boolean).length, 0);
    return sentences.length ? words / sentences.length : 0;
};

const hasImage = (html: string) => /<img\b[^>]*>/i.test(html || '');
const hasImageWithAlt = (html: string) => /<img\b[^>]*\balt\s*=\s*"(.*?)"[^>]*>/i.test(html || '');
const hasOutboundLink = (html: string) => /<a\b[^>]*\bhref\s*=\s*"(https?:\/\/(?!.*(localhost|127\.0\.0\.1))).*?"/i.test(html || '');
const hasInternalLink = (html: string) => /<a\b[^>]*\bhref\s*=\s*"(\/[^"]*|https?:\/\/[^"]*(yourdomain\.com|nhacong\.com\.vn))"/i.test(html || '');
const hasH2 = (html: string) => /<h2\b[^>]*>.*?<\/h2>/is.test(html || '');
const keywordInH2 = (html: string, kw: string) => {
    if (!kw) return false;
    const m = html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi) || [];
    return m.some(h => normalizeVi(h).includes(normalizeVi(kw)));
};
const keywordInFirstParagraph = (html: string, kw: string) => {
    if (!kw) return false;
    const m = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    return m ? normalizeVi(m[1]).includes(normalizeVi(kw)) : false;
};

type Params = {
    title: string;
    slug: string;
    excerpt: string;
    contentHtml: string;
    cover?: string | null;
    tags?: string[];
    focusKeyword: string;
};

export function useSeoScore({
    title, slug, excerpt, contentHtml, cover, tags = [], focusKeyword
}: Params): SeoScoreResult {
    const plain = stripHtml(contentHtml || '');
    const totalWords = wordCountFromHtml(contentHtml || '');
    const kw = (focusKeyword || '').trim();
    const kwCount = kw ? countOccurrences(plain, kw) : 0;
    const density = totalWords ? (kwCount / totalWords) * 100 : 0;
    const titleLen = (title || '').trim().length;
    const slugVal = slug || toSlug(title || '');
    const slugLen = slugVal.length;
    const descLen = (excerpt || '').length;
    const avgLen = avgSentenceLength(plain);

    const checks: SeoCheck[] = [
    { id:'title-length', label:'Tiêu đề ~40–60 ký tự', ok:titleLen>=40&&titleLen<=60, score:titleLen?(titleLen>=35&&titleLen<=65?1:0.5):0, hint:`Hiện tại: ${titleLen} ký tự.`, weight:1.2 },
    { id:'title-has-kw', label:'Tiêu đề chứa từ khóa trọng tâm', ok:!!kw&&normalizeVi(title).includes(normalizeVi(kw)), score:!!kw&&normalizeVi(title).includes(normalizeVi(kw))?1:0, weight:1.4 },
    { id:'slug-length', label:'Slug ngắn gọn (< 75 ký tự)', ok:slugLen>0&&slugLen<75, score:slugLen?(slugLen<75?1:0):0 },
    { id:'slug-has-kw', label:'Slug chứa từ khóa', ok:!!kw&&normalizeVi(slugVal).includes(normalizeVi(toSlug(kw))), score:!!kw&&normalizeVi(slugVal).includes(normalizeVi(toSlug(kw)))?1:0 },
    { id:'desc-length', label:'Mô tả ~120–160 ký tự', ok:descLen>=120&&descLen<=160, score:descLen?(descLen>=100&&descLen<=170?1:0.5):0, hint:`Hiện tại: ${descLen} ký tự.`, weight:1.2 },
    { id:'desc-has-kw', label:'Mô tả chứa từ khóa', ok:!!kw&&normalizeVi(excerpt).includes(normalizeVi(kw)), score:!!kw&&normalizeVi(excerpt).includes(normalizeVi(kw))?1:0 },
    { id:'content-words', label:'Nội dung ≥ 600 từ', ok:totalWords>=600, score:totalWords?Math.min(totalWords/600,1):0, hint:`Hiện tại: ${totalWords} từ.`, weight:1.4 },
    { id:'density', label:'Mật độ từ khóa 0.5%–2.5%', ok:!!kw&&density>=0.5&&density<=2.5, score:!!kw?(density>=0.3&&density<=3?1:0.5):0, hint:!!kw?`Hiện tại: ${density.toFixed(2)}%`:'Hãy nhập từ khóa trọng tâm.', weight:1.4 },
    { id:'first-paragraph-kw', label:'Từ khóa ở đoạn đầu', ok:keywordInFirstParagraph(contentHtml, kw), score:keywordInFirstParagraph(contentHtml, kw)?1:0 },
    { id:'has-h2', label:'Có thẻ H2 chia nội dung', ok:hasH2(contentHtml), score:hasH2(contentHtml)?1:0.5 },
    { id:'kw-in-h2', label:'Từ khóa xuất hiện trong ≥1 H2', ok:keywordInH2(contentHtml, kw), score:keywordInH2(contentHtml, kw)?1:0 },
    { id:'image-alt', label:'Có ảnh & thuộc tính alt', ok:hasImage(contentHtml)&&hasImageWithAlt(contentHtml), score:hasImage(contentHtml)?(hasImageWithAlt(contentHtml)?1:0.5):0, weight:1.1 },
    { id:'internal-link', label:'Có liên kết nội bộ', ok:hasInternalLink(contentHtml), score:hasInternalLink(contentHtml)?1:0 },
    { id:'outbound-link', label:'Có liên kết ra ngoài', ok:hasOutboundLink(contentHtml), score:hasOutboundLink(contentHtml)?1:0 },
    { id:'readability', label:'Độ dài câu trung bình ≤ 20 từ', ok:avgLen>0&&avgLen<=20, score:avgLen?(avgLen<=25?1:0.5):0, hint:avgLen?`Hiện tại: ~${avgLen.toFixed(1)} từ/câu.`:undefined, weight:1.1 },
    { id:'cover', label:'Có ảnh cover', ok:!!cover, score:cover?1:0 },
    { id:'has-tags', label:'Có ít nhất 1 tag', ok:(tags?.length||0)>0, score:(tags?.length||0)>0?1:0 },
    ];

    const totalWeight = checks.reduce((a,c)=>a+(c.weight??1),0);
    const weighted = checks.reduce((a,c)=>a+(c.score*(c.weight??1)),0);
    const score = Math.round((weighted/totalWeight)*100);

    const good = checks.filter(c=>c.ok);
    const warn = checks.filter(c=>!c.ok && c.score>0);
    const bad  = checks.filter(c=>c.score===0);

    return {
        score,
        checks,
        good,
        warn,
        bad,
        meta: { totalWords, density, avgSentenceLen: avgLen, titleLen, slugLen, descLen, kwCount }
    };
}
