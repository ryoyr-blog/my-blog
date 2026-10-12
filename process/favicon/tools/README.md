# ファビコンの制作記録

- `PNGJS_MODULE=/path/to/pngjs node process/favicon/tools/render.cjs` で作業ログの図形情報から途中の版を復元する。既存のPNGは上書きしない。
- `python3 process/favicon/tools/build_page.py` で制作過程ページを再生成する。
- 1は旧ファビコン、2〜7は記録からの復元、8の通常色は実ファイルの保存版。1と8のPNGはコピーしたもので、render.cjsでは上書きしない。
- 色と位置の定義はsteps/versions.json。変更前の記録は保持し、新しい版を追加する。
