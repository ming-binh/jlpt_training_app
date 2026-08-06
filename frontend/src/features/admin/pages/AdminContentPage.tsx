import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { adminService, type AdminContentItem, type ContentType } from '@/services/admin.service';
import { LevelBadge } from '../adminUi';

const TABS: { key: ContentType; label: string }[] = [
  { key: 'LESSON', label: 'Bài học' },
  { key: 'VOCAB', label: 'Từ vựng' },
  { key: 'KANJI', label: 'Kanji' },
  { key: 'GRAMMAR', label: 'Ngữ pháp' },
];

const LEVELS = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

export function AdminContentPage() {
  const [tab, setTab] = useState<ContentType>('LESSON');
  const [level, setLevel] = useState('ALL');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.getContent(tab, { level: level === 'ALL' ? undefined : level, search, page })
      .then((res) => {
        setItems(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(() => toast.error('Không tải được danh sách nội dung.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, level, search, page]);

  const handleDelete = async (item: AdminContentItem) => {
    if (!window.confirm(`Xoá "${item.title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminService.deleteContent(item.type, item.id);
      toast.success('Đã xoá.');
      load();
    } catch {
      toast.error('Không thể xoá mục này.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPage(0);
            }}
            className={cn(
              'rounded-lg border px-4 py-2 text-[12.5px] font-bold transition-colors',
              tab === t.key ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}

        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold outline-none"
        >
          {LEVELS.map((lv) => (
            <option key={lv} value={lv}>{lv === 'ALL' ? 'Tất cả trình độ' : lv}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tìm kiếm…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="min-w-0 flex-1 max-w-xs rounded-lg border border-border bg-card px-3.5 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-accent"
        />

        <span className="ml-auto text-xs text-muted-foreground">{totalElements} mục</span>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-secondary/60 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-4.5 py-3">Tiêu đề</th>
              <th className="px-4.5 py-3">Cấp độ</th>
              {tab === 'LESSON' && <th className="px-4.5 py-3">Số mục</th>}
              {tab === 'LESSON' && <th className="px-4.5 py-3">Trạng thái</th>}
              <th className="px-4.5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4.5 py-3 font-semibold">{item.title}</td>
                <td className="px-4.5 py-3"><LevelBadge level={item.level} /></td>
                {tab === 'LESSON' && <td className="px-4.5 py-3 text-muted-foreground">{item.itemCount}</td>}
                {tab === 'LESSON' && (
                  <td className="px-4.5 py-3">
                    <span className={cn('flex items-center gap-1.5 text-[11.5px] font-semibold', item.published ? 'text-emerald-400' : 'text-muted-foreground')}>
                      <span className={cn('size-1.5 rounded-full', item.published ? 'bg-emerald-400' : 'bg-muted-foreground')} />
                      {item.published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                )}
                <td className="px-4.5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11.5px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                  Không có nội dung nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
          >
            Trước
          </button>
          <span className="text-muted-foreground">Trang {page + 1} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
