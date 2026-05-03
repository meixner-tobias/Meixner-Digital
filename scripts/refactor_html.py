from pathlib import Path
import re

root = Path('h:/Meine Ablage/Meixner-Digital/Meixner-Website')
html_files = sorted(root.rglob('*.html'))
modified = []

head_patterns = [
    re.compile(r'<script>\s*window\.dataLayer[\s\S]*?<\/script>\s*', flags=re.MULTILINE),
    re.compile(r'<script>\s*if \(window\.location\.hostname !== \'localhost\'[\s\S]*?<\/script>\s*', flags=re.MULTILINE),
    re.compile(r'<script>\(function\(w,d,s,l,i\)\{[\s\S]*?googletagmanager\.com\/gtm\.js.*?<\/script>\s*', flags=re.MULTILINE),
]

body_pattern = re.compile(
    r'<script>\s*[\s\S]*?(?:toggleTheme|IntersectionObserver|const langBtn|document\.querySelectorAll\(\'\.reveal\'\)|window\.addEventListener\(\'scroll\'|window\.addEventListener\(\"scroll\"))[\s\S]*?<\/script>\s*(?=</body>)',
    flags=re.MULTILINE,
)

for path in html_files:
    text = path.read_text(encoding='utf8')
    original = text

    for pattern in head_patterns:
        text = pattern.sub('', text)

    text = body_pattern.sub('', text)

    if '<script src="/js/main.js"></script>' not in text:
        text = text.replace('</head>', '<script src="/js/main.js"></script>\n</head>', 1)

    if text != original:
        path.write_text(text, encoding='utf8')
        modified.append(str(path.relative_to(root)))

print('modified:', len(modified))
for f in modified:
    print(f)
