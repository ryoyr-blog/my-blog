from pathlib import Path
import sys
sys.path.insert(0, str(Path.home() / '.codex/skills/process-page'))
from pagekit import Page, load_png, save_png, upscale
here = Path(__file__).resolve().parents[1]
page = Page('プロフィール画像のドット絵の制作過程', '元のリスを128×128のドット絵にする（2026-10-12）', steps=str(here / 'steps'))
page.section('1. プロフィール画像のドット絵', page.p('元の手描きのリスを参考に、imagegenで1枚生成。素朴な表情、長い耳、大きな渦巻きのしっぽ、白黒の配色を保持するよう指定した。背景は透明。元画像は1-reference.png、生成出力は1-generated.png、説明文は1-prompt.txtに保存。生成出力は1254×1254pxのため、補間なしの最近傍で128×128pxに縮小した。ブログにはまだ設置していない。') + page.sheet(['1.png'], cols=3, k=4) + page.p('128×128pxの原寸はsteps/1.png。上は4倍で表示。正本はassets/img/blog-character/profile-pixel-128-v1.png。元の画像をもとにした生成案で、線や細部は元と完全には一致しない。'), group='プロフィールのドット絵')
save_png(str(here / '完成.png'), upscale(load_png(str(here / 'steps/1.png')), 4))
page.section('2. 64×64・黒のみ・内側も透過', page.p('ユーザーの指定に合わせ、元のプロフィール画像を参考にimagegenで1枚作り直した。64×64の黒い輪郭のドット絵を指定し、背景・耳・顔・胴体・しっぽの内側を透明にした。生成出力は2-generated.png、説明文は2-prompt.txt。最近傍で64×64へ縮小し、RGBを黒のみ、アルファを0または255に統一した。128px版はそのまま保持。') + page.sheet(['2.png'], cols=3, k=8) + page.p('上は8倍の表示。原寸はsteps/2.png、正本はassets/img/blog-character/profile-pixel-64-v2.png。色は黒のみで、白い塗りつぶしはない。ブログにはまだ設置していない。'), group='プロフィールのドット絵')
save_png(str(here / '完成-2.png'), upscale(load_png(str(here / 'steps/2.png')), 8))
page.section('3. 128×128版と64×64版の比較', page.p('左が128×128版、右が64×64版。同じ表示サイズになるよう、左は4倍、右は8倍で拡大。64px版は黒線のみで内側も透明。') + '<div class="gallery">' + page.img('1.png', 4, '128×128版').replace('<figure>', '<figure><figcaption>128×128（4倍）</figcaption>') + page.img('2.png', 8, '64×64版').replace('<figure>', '<figure><figcaption>64×64（8倍・黒線のみ）</figcaption>') + '</div>', group='プロフィールのドット絵')
page.write(str(here / '制作過程.html'))
