import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
      <p className="text-xs text-muted-foreground">
        Hiển thị <span className="font-semibold text-foreground">{startItem} - {endItem}</span> trong tổng số{" "}
        <span className="font-semibold text-accent">{totalElements}</span> bản ghi
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="size-4" /> Trang trước
        </button>

        <span className="px-3 font-mono text-xs text-muted-foreground">
          Trang <strong className="text-foreground">{currentPage + 1}</strong> / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
        >
          Trang sau <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
