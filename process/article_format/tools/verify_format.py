"""変更前後の生成HTMLで、本文・段落・強調・リンク・コードを比較する。"""
from html.parser import HTMLParser
from pathlib import Path
import re


class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = None
        self.stack = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if not self.stack:
            if 'article-content' not in attrs.get('class', '').split():
                return
            self.root = [tag, attrs, []]
            self.stack.append(self.root)
            return
        node = [tag, attrs, []]
        self.stack[-1][2].append(node)
        if tag not in {'br', 'hr', 'img', 'input', 'meta', 'link', 'wbr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_data(self, data):
        if self.stack:
            self.stack[-1][2].append(data)


def normalize(node, literal=False):
    if isinstance(node, str):
        if literal:
            return node
        return re.sub(r'\s+', '', node.replace('、', '，').replace('。', '．'))
    tag, attrs, children = node
    if attrs.get('aria-label') == 'アンカー' or 'anchor' in attrs.get('class', '').split():
        return None
    literal = literal or tag in {'pre', 'code'}
    parts = []
    for child in children:
        value = normalize(child, literal)
        if value is None or value == '':
            continue
        if isinstance(value, str) and parts and isinstance(parts[-1], str):
            parts[-1] += value
        else:
            parts.append(value)
    return ('heading' if re.fullmatch(r'h[1-6]', tag) else tag, attrs.get('href'), parts)


def read_article(path):
    parser = ArticleParser()
    parser.feed(path.read_text())
    assert parser.root is not None, path
    return normalize(parser.root)


if __name__ == '__main__':
    repo = Path(__file__).resolve().parents[3]
    for path in sorted((repo / 'content/posts').glob('*.md')):
        if path.name == '_index.md':
            continue
        relative = Path('posts') / path.stem / 'index.html'
        old = read_article(Path('/tmp/my-blog-format-before') / relative)
        new = read_article(Path('/tmp/my-blog-format-after') / relative)
        assert old == new, f'本文の構造や内容に差があります: {path.name}'
        print(f'{path.name}: 本文・段落・強調・リンク・コードが一致（句読点・空白・見出しレベルを除く）')
