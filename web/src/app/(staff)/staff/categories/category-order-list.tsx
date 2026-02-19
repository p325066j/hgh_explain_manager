"use client";

import { useMemo, useState, useTransition } from "react";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  order: number;
  videoCount: number;
};

type Props = {
  categories: CategoryItem[];
  onSave: (orderedIds: string[]) => Promise<void>;
};

const reorder = (list: CategoryItem[], fromIndex: number, toIndex: number) => {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export default function CategoryOrderList({ categories, onSave }: Props) {
  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );
  const [items, setItems] = useState(sorted);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    if (items.length !== sorted.length) return true;
    return items.some((item, index) => item.id !== sorted[index]?.id);
  }, [items, sorted]);

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const fromIndex = items.findIndex((item) => item.id === draggingId);
    const toIndex = items.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    setItems(reorder(items, fromIndex, toIndex));
  };

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      await onSave(items.map((item) => item.id));
      setStatus("保存しました。");
    });
  };

  return (
    <div className="grid gap-3">
      <ul className="grid gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDraggingId(item.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(item.id)}
            className={`flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2 text-sm ${
              draggingId === item.id ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-md border border-slate-700/80 px-2 py-1 text-xs text-slate-300">
                Drag
              </span>
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-400">
                  {item.slug} / 動画 {item.videoCount} 本
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">
              #{items.findIndex((entry) => entry.id === item.id) + 1}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200 transition enabled:hover:border-sky-400 enabled:hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          並び順を保存
        </button>
        {status && <span className="text-xs text-emerald-200">{status}</span>}
        {isPending && <span className="text-xs text-slate-400">保存中...</span>}
      </div>
    </div>
  );
}
