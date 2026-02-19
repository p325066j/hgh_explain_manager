import Link from "next/link";

export default function PatientVideoNotFound() {
    return (
        <div className="grid gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 text-center text-slate-200">
            <h1 className="text-xl font-semibold text-white">動画が見つかりませんでした</h1>
            <p className="text-sm text-slate-300">ページが移動したか、URLの期限が切れている可能性があります。</p>
            <div>
                <Link href="/patient" className="text-sm text-sky-200 underline underline-offset-4">
                    カテゴリ一覧に戻る
                </Link>
            </div>
        </div>
    );
}
