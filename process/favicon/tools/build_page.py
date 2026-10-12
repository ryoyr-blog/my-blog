from pathlib import Path
import sys,json,base64,html
sys.path.insert(0,str(Path.home()/'.codex/skills/process-page'))
from pagekit import Page
here=Path(__file__).resolve().parents[1]
versions=json.loads((here/'steps/versions.json').read_text())
pg=Page('ファビコンの制作過程','タブアイコンの変更を拡大して比較（2026-10-12）',steps=str(here/'steps'))
pg.section('記録について',pg.p('変更前から現在までを古い順に表示。途中の版（2〜7）は、会話と作業ログに残る色・位置・半径から復元したもので、当時の出力ファイルそのものではない。1は残っていた旧PNG、8の通常色は現在の実ファイル。正本はstatic/favicon-dot.svgとscripts/build-favicons.cjs。背景のチェック柄は透明部分を示す。'),group='概要')
def native(n,dark=False):
    imgs=[]
    for size in (16,32):
        filename=f'{n}-{size}'+('-dark' if dark else '')+'.png'
        uri='data:image/png;base64,'+base64.b64encode((here/'steps'/filename).read_bytes()).decode()
        imgs.append(f'<span style="display:inline-flex;align-items:center;gap:8px;margin-right:20px">{size}px <img src="{uri}" width="{size}" height="{size}" style="image-rendering:auto;max-width:none" alt="{n}の{size}px表示"></span>')
    return '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:14px;background:#fff;border-radius:6px;color:#17171b">'+''.join(imgs)+'</div>'
for start in (0,3,6):
    batch=versions[start:min(start+3,8)]
    figs=''
    notes=''
    for v in batch:
        n=v['n']
        fig=pg.img(f'{n}.png',8 if n==1 else 1,v['title'])
        figs+=fig.replace('<figure>',f'<figure><figcaption>{n}. {html.escape(v["title"])}</figcaption>')
        notes+=f'<h3>{n}. {html.escape(v["title"])}</h3>'+pg.p(v['note'])+native(n)
    pg.section(f'{batch[0]["n"]}〜{batch[-1]["n"]}. 変更の流れ','<div class="gallery">'+figs+'</div>'+notes,group='変更の流れ')
pg.section('現在の版を大きく確認',pg.p('左は通常色、右はダーク設定の色。512pxの画像を大きく表示する。')+'<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:24px">'+pg.img('8.png',1,'現在の版・通常色')+pg.img('8-dark.png',1,'現在の版・ダーク設定')+'</div>'+pg.p('通常色のタブサイズ')+native(8)+pg.p('ダーク設定のタブサイズ')+native(8,True),group='現在の版')
pg.section('9. オレンジをもう少し大きく',pg.p('オレンジの半径を11から13へ約18%拡大。白い縁取りは2px、紫・白背景・位置は保持。左が変更前の8、右が新しい9。通常色の画像は実ファイルの保存版。')+'<div class="gallery">'+pg.img('8.png',1,'8. 変更前').replace('<figure>','<figure><figcaption>8. 変更前</figcaption>')+pg.img('9.png',1,'9. オレンジを拡大').replace('<figure>','<figure><figcaption>9. オレンジを拡大</figcaption>')+'</div>'+pg.p('9の実際のタブサイズ')+native(9),group='オレンジの大きさ')
pg.section('10. 第8版に戻す',pg.p('ユーザーの指示で、第9版の拡大を取り消し、第8版に戻した。オレンジの半径は11、白い縁取りは2px。第9版は比較の記録として保持する。')+pg.img('10.png',1,'第8版に戻した採用版')+native(10),group='採用版')
pg.write(str(here/'制作過程.html'))
