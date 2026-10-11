# 制作過程の生成

`python3 process/new_article_20261012/tools/build_page.py` で保存版からページを生成する。
共通部品は `~/.codex/skills/process-page/pagekit.py` を使用する。
新しい版は番号付きで保存し、過去の記録を保持してページ末尾に追記する。

`revise_article.py` は保存した第2版から添削の第3版を生成したスクリプト。過去の版を保護するため再実行は停止する。第4版では助詞の重なりを避ける語順調整を行った。
