from pathlib import Path
import sys

sys.path.insert(0, str(Path.home() / '.codex/skills/process-page'))
from pagekit import Page

here = Path(__file__).resolve().parents[1]
page = Page('思考カテゴリの目次の制作過程', 'カテゴリに応じた目次表示（2026-10-11）', steps=str(here / 'steps'))
page.section('1. 思考カテゴリでは目次を非表示',
             page.p('テーマの single.html を layouts/_default/single.html に上書き用テンプレートとして配置。「思考」をカテゴリに含む記事では目次と目次用の欄を出力しない。PC・スマホ共通で、記事ごとの表示設定より優先する。他のカテゴリは従来の設定を使用する。')
             + page.text_diff(page.read('1.html'), page.read('2.html')), group='目次表示')
page.section('2. 新しい記事を思考カテゴリに設定',
             page.p('「AIの普及と規制」を既存の思考記事と同じカテゴリに設定した。本文はそのまま保持する。')
             + page.text_diff(page.read('3.md'), page.read('4.md')), group='記事のカテゴリ')
page.write(str(here / '制作過程.html'))
