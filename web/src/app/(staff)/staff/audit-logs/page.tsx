import { AuditAction, AuditEntityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const entityOptions = [
  { value: "", label: "すべて" },
  { value: AuditEntityType.VIDEO, label: "動画" },
  { value: AuditEntityType.CATEGORY, label: "カテゴリ" },
  { value: AuditEntityType.VISIBILITY_SYNC, label: "公開反映" },
];

const actionOptions = [
  { value: "", label: "すべて" },
  { value: AuditAction.CREATE, label: "作成" },
  { value: AuditAction.UPDATE, label: "更新" },
  { value: AuditAction.DELETE, label: "削除" },
  { value: AuditAction.SYNC, label: "同期" },
];

const toEntityType = (value?: string) =>
  value && Object.values(AuditEntityType).includes(value as AuditEntityType)
    ? (value as AuditEntityType)
    : undefined;

const toAction = (value?: string) =>
  value && Object.values(AuditAction).includes(value as AuditAction)
    ? (value as AuditAction)
    : undefined;

type SearchParams = {
  entityType?: string;
  action?: string;
  entityId?: string;
  limit?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function StaffAuditLogsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const entityType = toEntityType(params.entityType);
  const action = toAction(params.action);
  const entityId = params.entityId?.trim() ?? "";
  const limitRaw = Number(params.limit);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 10), 200) : 50;

  const where: Prisma.AuditLogWhereInput = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;
  if (entityId) where.entityId = { contains: entityId };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return (
    <div className="grid gap-6">
      <section className="ui-card">
        <h1 className="ui-title">監査ログ</h1>
        <p className="mt-2 text-sm text-slate-300">
          スタッフが行った操作の記録を確認します。API 経由の操作も同じログに記録されます。
        </p>
      </section>

      <section className="ui-card">
        <h2 className="text-sm font-semibold text-slate-200">記録対象</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-300">
          <li>動画: 登録・公開状態変更・API 登録</li>
          <li>カテゴリ: 追加・更新・削除（UI/API）</li>
          <li>公開状態の一括反映: 実行履歴</li>
        </ul>
      </section>

      <section className="ui-card">
        <h2 className="text-sm font-semibold text-slate-200">絞り込み</h2>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr_0.7fr_auto]">
          <label className="grid gap-1 text-xs text-slate-300">
            対象
            <select
              name="entityType"
              defaultValue={entityType ?? ""}
              className="ui-input text-sm"
            >
              {entityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-slate-300">
            操作
            <select
              name="action"
              defaultValue={action ?? ""}
              className="ui-input text-sm"
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-slate-300">
            対象ID
            <input
              name="entityId"
              defaultValue={entityId}
              placeholder="例: youtubeId / categoryId"
              className="ui-input text-sm"
            />
          </label>
          <label className="grid gap-1 text-xs text-slate-300">
            取得件数
            <input
              name="limit"
              type="number"
              min={10}
              max={200}
              defaultValue={limit}
              className="ui-input text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="ui-primary-btn"
            >
              反映
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-800/80">
        <table className="w-full table-auto text-left text-sm text-slate-200">
          <thead className="bg-[#249191] text-xs uppercase tracking-wide text-slate-100">
            <tr>
              <th className="px-5 py-3">日時</th>
              <th className="px-5 py-3">対象</th>
              <th className="px-5 py-3">操作</th>
              <th className="px-5 py-3">対象ID</th>
              <th className="px-5 py-3">内容</th>
              <th className="px-5 py-3">メタ情報</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {logs.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-slate-400" colSpan={6}>
                  該当するログがありません。
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-gray-600">
                  <td className="px-5 py-4 text-xs text-slate-300">
                    {log.createdAt.toLocaleString("ja-JP", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-200">{log.entityType}</td>
                  <td className="px-5 py-4 text-xs text-slate-200">{log.action}</td>
                  <td className="px-5 py-4 text-xs text-slate-300">{log.entityId}</td>
                  <td className="px-5 py-4 text-sm text-slate-200">{log.message ?? "-"}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {log.meta ? JSON.stringify(log.meta) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
