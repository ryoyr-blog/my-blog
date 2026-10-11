"""記事の書式を統一する。コード・数式・URLと段落の区切りを保持する。"""
from datetime import datetime, date
import json
from pathlib import Path
import re
import tomllib

import yaml


def split_article(text):
    marker, header, body = text.split(text.splitlines()[0], 2)
    return header, body.lstrip('\n')


def metadata(text):
    header, _ = split_article(text)
    if text.startswith('+++'):
        result = tomllib.loads(header)
    else:
        result = yaml.safe_load(header)
    for key, value in result.items():
        if isinstance(value, (datetime, date)):
            result[key] = value.isoformat()
    result.setdefault('draft', False)
    return result


def toml_value(value):
    if isinstance(value, bool):
        return 'true' if value else 'false'
    return json.dumps(value, ensure_ascii=False)


def format_body(body, lower_headings=False):
    output = []
    fence = None
    math = False
    protected = re.compile(r'(`+)[^`]*?\1|https?://[^\s<>]+|\$[^$\n]+\$')
    structural = re.compile(r'^(?:#{1,6} |[-*+] |\d+\. |>|\{\{<|<!--|---\s*$)')
    for line in body.splitlines():
        stripped = line.strip()
        if fence:
            output.append(line)
            if stripped.startswith(fence):
                fence = None
            continue
        if stripped.startswith(('```', '~~~')):
            if output and output[-1] != '':
                output.append('')
            fence = stripped[:3]
            output.append(line)
            continue
        if stripped == '$$':
            math = not math
            output.append(line)
            continue
        if math:
            output.append(line)
            continue
        if not stripped:
            if output and output[-1] != '':
                output.append('')
            continue
        # フェンスを閉じた直後の本文の前にも空行を入れる。
        if output and output[-1].strip() in ('```', '~~~'):
            output.append('')
        parts = []
        position = 0
        for match in protected.finditer(line):
            parts.append(line[position:match.start()].replace('、', '，').replace('。', '．'))
            parts.append(match.group())
            position = match.end()
        parts.append(line[position:].replace('、', '，').replace('。', '．'))
        line = ''.join(parts)
        if lower_headings and re.match(r'^#{1,5} ', line):
            line = '#' + line
        if line.startswith('#') and re.match(r'^#{1,6} ', line):
            if output and output[-1] != '':
                output.append('')
            output.extend([line, ''])
        elif structural.match(line):
            if re.match(r'^(?:[-*+] |\d+\. )', line) and output and output[-1] != '' and not re.match(r'^(?:[-*+] |\d+\. |  )', output[-1]):
                output.append('')
            output.append(line)
        else:
            # 文末で改行するが、引用符内や太字・コードの途中では分割しない。
            protected_spans = [m.span() for m in protected.finditer(line)]
            quote_depth = 0
            start = 0
            for i, char in enumerate(line):
                if any(a <= i < b for a, b in protected_spans):
                    continue
                if char in '「『（':
                    quote_depth += 1
                elif char in '」』）':
                    quote_depth = max(0, quote_depth - 1)
                if char == '．' and not quote_depth and line[:i + 1].count('**') % 2 == 0 and i + 1 < len(line) and line[i + 1:].strip():
                    output.append(line[start:i + 1])
                    start = i + 1
                    while start < len(line) and line[start] == ' ':
                        start += 1
            output.append(line[start:])
    return '\n'.join(output).strip('\n') + '\n'


def format_article(text, lower_headings=False):
    data = metadata(text)
    keys = ['title', 'date', 'draft', 'categories', 'tags']
    keys += [key for key in data if key not in keys]
    header = '\n'.join(f'{key} = {toml_value(data[key])}' for key in keys if key in data)
    _, body = split_article(text)
    return '+++\n' + header + '\n+++\n\n' + format_body(body, lower_headings)


if __name__ == '__main__':
    repo = Path(__file__).resolve().parents[3]
    steps = Path(__file__).resolve().parents[1] / 'steps'
    steps.mkdir(parents=True, exist_ok=True)
    for i, path in enumerate(sorted((repo / 'content/posts').glob('*.md'))):
        if path.name == '_index.md':
            continue
        original = path.read_text()
        formatted = format_article(original, lower_headings=path.name == 'ai_adoption_and_regulation.md')
        before = steps / f'{2 * i - 1}.md'
        after = steps / f'{2 * i}.md'
        # 保存済みの過去の版を上書きしない。
        before.open('x').write(original)
        after.open('x').write(formatted)
        assert metadata(original) == metadata(formatted), path
        path.write_text(formatted)
        print(path.name)
