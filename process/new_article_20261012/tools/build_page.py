from pathlib import Path
import sys

sys.path.insert(0, str(Path.home() / '.codex/skills/process-page'))
from pagekit import Page

here = Path(__file__).resolve().parents[1]
page = Page('テーマ未定の記事の制作過程', '新しい下書きの準備（2026-10-12）', steps=str(here / 'steps'))
page.section('1. 下書きを作成',
             page.p('content/posts/new_article.md を統一済みのTOML書式で作成。仮タイトルは「新しい記事」。テーマは後で決めるため、本文・カテゴリ・タグは未設定。draft = true で公開を保留する。')
             + page.pre(page.read('1.md')), group='記事ページ')
page.section('2. 原稿の添削（第2版 → 第3版）',
             page.p('欅坂46と櫻坂46についての原稿を添削。感謝と批判、挑戦する義務についての主張や断定の強さは保持した。曲名を引用符で区切り、「長い時間活動を見る」などの言い回しを整えた。句読点を「，」「．」に統一し、段落の区切りと順序を保って1文ごとに改行した。タイトル・カテゴリ・タグ・公開設定はそのまま。')
             + page.text_diff(page.read('2.md'), page.read('3.md')), group='記事の添削')
page.section('3. 語順の調整（第3版 → 第4版）',
             page.p('「自分だけが欅坂が終わった場所に」という助詞の重なりを避け、「欅坂が終わった場所に，自分だけが」という語順に整えた。')
             + page.text_diff(page.read('3.md'), page.read('4.md')), group='記事の添削')
page.section('4. 下書き設定を削除して公開対象にする',
             page.p('ユーザーの指示で draft = true の行を削除した。本文とタイトル、カテゴリ、タグはそのまま保持し、通常のビルドで出力されることを確認する。')
             + page.text_diff(page.read('4.md'), page.read('5.md')), group='記事の公開')
page.section('5. カテゴリとタグを設定',
             page.p('カテゴリを「思考」に設定。タグは題材の「欅坂46」「櫻坂46」「アイドル」、内省や議論の軸である「自己認識」「継続性」「批評」とした。本文は変更していない。')
             + page.text_diff(page.read('5.md'), page.read('6.md')), group='記事の分類')
page.section('6. 記事タイトルを決定',
             page.p('ユーザーが短い体言止めの候補から「欅坂46への未練」を選んだため、仮タイトルを変更した。本文とその他の設定は保持した。')
             + page.text_diff(page.read('6.md'), page.read('7.md')), group='記事タイトル')
page.write(str(here / '制作過程.html'))
