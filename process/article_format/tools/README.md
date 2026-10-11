# 記事書式統一の記録

- `python3 process/article_format/tools/build_page.py`: 保存版から制作過程を生成する。Python標準ライブラリと共通の pagekit.py を使用。
- `format_articles.py`: 初回の書式統一に使ったスクリプト。PyYAML を使用。保存済みの版を上書きしないため、再実行すると停止する。新たな変更には新しい番号の保存版を使うこと。
- `verify_format.py`: `/tmp/my-blog-format-before` と `/tmp/my-blog-format-after` の生成HTMLで本文構造を比較する。両ディレクトリは変更前・変更後にそれぞれ Hugo の下書き・未来記事込みビルドで作成した。

正本は `content/posts/`。steps/ は当時の記録として保持し、新しい版と説明は末尾へ追記する。
