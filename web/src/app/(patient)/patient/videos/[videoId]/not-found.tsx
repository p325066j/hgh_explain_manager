import Link from "next/link";

export default function PatientVideoNotFound() {
  return (
    <div className="ui-card grid gap-4 text-center text-slate-200">
      <h1 className="text-xl font-semibold text-white">動画が見つかりませんでした</h1>
      <p className="text-sm text-slate-300">
        ページが削除されたか、URL が間違っている可能性があります。
      </p>
      <div>
        <Link href="/patient" className="ui-link text-sm">
          カテゴリ一覧に戻る
        </Link>
      </div>
    </div>
  );
}
