# Coconut の Mizuki 9.0 移行

- 移行元: `a47d5ecd172ad60b903c855aa80a7d847dbbd394` (Mizuki 8.3)
- 移行先: [LyraVoid/Mizuki 9.0](https://github.com/LyraVoid/Mizuki/releases/tag/9.0)
  (`da1ab110fc0770a633fff9ff6c25c530df67ec9e`)

Coconut のサイト名、公開 URL、日本語設定、プロフィール、バナー、写真、
記事の URL、About ページ、プロジェクト紹介、スキル情報を引き継いだ。
KAGUYA AI の独自プロジェクトページ、案内キャラクターの会話 UI、
フォント、フッターの表示設定も新しいコンポーネント構成へ移した。
テーマのサンプル記事や非表示のサンプルアルバムは公開しない。

「AIサーバー宇宙運用計画」
(`src/content/posts/2026-03-11-ai-space-server-plan.md`) を削除した。
記事一覧、前後の記事リンク、RSS、Atom、サイトマップ、検索インデックスは
残りの記事からビルド時に再生成される。

9.0 の新しい目次設定と関連記事設定に対応し、音楽プレーヤーの無効設定を維持した。
Astro 6 の実行条件に合わせ、Cloudflare Pages 用の Node.js バージョンを
`.node-version` で 22 系に指定した。新テーマで WebP に変わった桜の画像も参照先を更新した。
ページ遷移時にフローティング操作ボタンのインラインスクリプトが再実行されても、
変数宣言やイベントリスナーが重複しないようにした。

## 確認方法

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm check
ENABLE_CONTENT_SYNC=false corepack pnpm build
```

デスクトップとモバイルでホーム、北海道の記事、プロジェクト、スキルを確認する。
残した記事と写真、案内キャラクターの動作を確認し、削除記事の URL が 404 になること、
RSS・Atom・サイトマップ・検索結果に削除記事が含まれないことを確認する。
