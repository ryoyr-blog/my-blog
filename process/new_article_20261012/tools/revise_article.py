"""保存した原稿を添削し、第3版を作る。主張・段落・文章の順序を保持する。"""
from pathlib import Path
import sys

here = Path(__file__).resolve().parents[1]
repo = here.parents[1]
sys.path.insert(0, str(repo / 'process/article_format/tools'))
from format_articles import format_body

original = (here / 'steps/2.md').read_text()
header, body = original.split('+++', 2)[1:]
replacements = [
    ('長い時間活動を見る。', '長い時間にわたって活動を見る。'),
    ('そこに出力されたものを見て考えたい。', 'そうして表に出されたものを見て考えたい。'),
    ('では、何によって差が生まれるのか。', 'では、何によってその違いが生まれるのか。'),
    ('おそらく、それだけを理由に離れることはなかったと思う。', 'おそらく、その失敗だけを理由に離れることはなかったと思う。'),
    ('何を引き継ぐべきなのか。', '何を引き継ぐべきなのだろうか。'),
    ('その人たちに、こちら側の未解決の感情を背負わせることは違うと思う。', 'その人たちに、こちら側の未解決の感情を背負わせるのは違うと思う。'),
    ('ここまで考えると、自分の中にある違和感は、櫻坂そのものへの不満だけではないことが分かる。', 'ここまで考えると、自分の中にある違和感が、櫻坂そのものへの不満だけではないことが分かる。'),
    ('欅坂とは何かという意味も、', '「欅坂とは何か」という意味も、'),
    ('欅坂の終わった場所', '欅坂が終わった場所'),
    ('この二つをもっと自然に同時に扱えるようになるかもしれない。', 'この二つを同時に、もっと自然に扱えるようになるかもしれない。'),
]
for old, new in replacements:
    assert old in body, old
    body = body.replace(old, new)

# 曲名を引用符で区切り、列挙と文章との境界を分かりやすくする。
import re
song_titles = [
    'サイレントマジョリティー', '不協和音', 'ガラスを割れ！', 'アンビバレント',
    '危なっかしい計画', '制服と太陽', '風に吹かれても', '微笑みが悲しい',
    '語るなら未来を…', 'ボブディランは返さない', '世界には愛しかない', '黒い羊',
]
for title in song_titles:
    body = body.replace(title, f'「{title}」')

result = '+++' + header + '+++\n\n' + format_body(body.lstrip('\n'))
assert result.split('+++', 2)[1] == header
assert len(re.split(r'\n\s*\n', body.strip())) == len(re.split(r'\n\s*\n', result.split('+++', 2)[2].strip()))
(here / 'steps/3.md').open('x').write(result)
(repo / 'content/posts/new_article.md').write_text(result)
