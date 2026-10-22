# 再生成

- `PNGJS_MODULE=/path/to/pngjs node process/profile_pixel/tools/resize.cjs process/profile_pixel/1-generated.png process/profile_pixel/1.png` で生成出力を128×128へ最近傍で縮小する。色と透明度は生成出力のまま。
- 生成には組み込みimagegenを使用。生成の説明文は1-prompt.txt。

- `PNGJS_MODULE=/path/to/pngjs node process/profile_pixel/tools/prepare64.cjs process/profile_pixel/2-generated.png process/profile_pixel/2.png` で64px版を作成。黒のみ・透明度0/255にそろえる。
