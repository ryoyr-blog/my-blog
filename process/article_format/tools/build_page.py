from pathlib import Path
import sys

sys.path.insert(0, str(Path.home() / '.codex/skills/process-page'))
from pagekit import Page

here = Path(__file__).resolve().parents[1]
page = Page('記事書式統一の制作過程', '5記事の書式を統一（2026-10-12）', steps=str(here / 'steps'))
page.section('統一ルール', page.p('設定は TOML、順序は title・date・draft・categories・tags・その他。文字列は二重引用符、配列のカンマ後に空白。本文の句読点は「，」「．」。段落を保持して1文ごとに改行し、見出し・リスト・コードブロックの前後に空行を置く。AIの記事の見出しを1段下げる。コード・数式・URL・太字の範囲を保持する。公開済み記事の draft は明示的に false とした。'), group='統一ルール')
articles = [
    ('AIの普及と規制', '1.md', '2.md'),
    ('AIの言葉に心を動かされることは，みじめか？', '3.md', '4.md'),
    ('芸術の批評の必要性', '5.md', '6.md'),
    ('意識に関わる3つの問題', '7.md', '8.md'),
    ('blowfishの設定で詰まったら', '9.md', '10.md'),
]
for title, before, after in articles:
    page.section(f'{before[:-3]} → {after[:-3]}：{title}',
                 page.text_diff(page.read(before), page.read(after)), group=title)
page.section('10 → 11：リストの段落構造を保持',
             page.p('技術記事のリスト内に追加された空行で項目の表示が変わるため、その空行を取り除いた。途中の第10版も保存している。')
             + page.text_diff(page.read('10.md'), page.read('11.md')), group='blowfishの設定で詰まったら')
page.section('検証結果', page.p('変更前後で Hugo ビルド成功。5記事の本文HTMLを比較し、句読点・空白・見出しレベル以外の本文、段落、強調、リンク、コードが一致。設定値も一致し、日付・カテゴリ・タグ・公開状態を保持した。'), group='検証')
page.section('プレビューの文字化け・設定混入を修正',
             page.p('書式変更後、起動中の Hugo サーバーではタグ配列の末尾と +++ が本文に混入し、UTF-8 の途中で切れた文字が配信された。記事ファイルと独立ビルドは正常。サーバーを再起動し --disableFastRender を指定した。5記事の実際の応答が正常なUTF-8で、独立ビルドの本文と一致することを確認した。記事ファイルの追加変更は行っていない。'), group='プレビュー修正')
page.write(str(here / '制作過程.html'))
