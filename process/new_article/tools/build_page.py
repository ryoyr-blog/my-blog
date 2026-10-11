from pathlib import Path
import sys

sys.path.insert(0, str(Path.home() / '.codex/skills/process-page'))
from pagekit import Page

here = Path(__file__).resolve().parents[1]
page = Page('新しい記事の制作過程', '記事ページの準備（2026-10-11）', steps=str(here / 'steps'))
page.section('1. 下書きページを作成',
             page.p('content/posts/new_article.md に既存記事と同じ TOML 形式で下書きを作成。仮タイトルは「新しい記事」。本文、カテゴリ、タグはこれから記入する。draft = true のため通常の公開ビルドには含まれない。')
             + page.pre(page.read('1.md')), group='記事ページ')
page.section('2. 記事タイトルを設定',
             page.p('ユーザーの指定により、記事タイトルを「AIの普及と規制」に変更した。')
             + page.text_diff(page.read('1.md'), page.read('2.md')), group='記事ページ')
page.section('3. 記事ファイル名を変更',
             page.p('タイトルに合わせて content/posts/new_article.md を content/posts/ai_adoption_and_regulation.md に変更した。既存記事と同じ英語のスネークケースを使用。記事の内容は第2版と同じ。'), group='記事ページ')
page.section('4. 記事のタグを設定（2026-10-12）',
             page.p('既存の思考記事のタグと本文から提案した6つに、ユーザー指定の「意識」を追加。AI、創造性、自己認識、意識、主観経験、記憶、思考実験を設定した。変更前の本文も第3版として保存している。')
             + page.text_diff(page.read('3.md'), page.read('4.md')), group='記事ページ')
page.section('5. 下書き設定を解除（2026-10-12）',
             page.p('ユーザーの指示で draft を false に変更した。書式統一後の本文とタグは保持し、通常の公開用ビルドに含める。')
             + page.text_diff(page.read('5.md'), page.read('6.md')), group='記事ページ')
page.write(str(here / '制作過程.html'))
