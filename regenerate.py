import json
import os

base_dir = r'c:\Users\hexinlin\skills\chip-comparator-web'
index_path = os.path.join(base_dir, 'index.html')
style_path = os.path.join(base_dir, 'style.css')
script_path = os.path.join(base_dir, 'script.js')
data_path = os.path.join(base_dir, 'chips_data.json')
output_path = os.path.join(base_dir, 'ESP32_Chip_Comparator_Portable.html')

with open(index_path, 'r', encoding='utf-8') as f: html = f.read()
with open(style_path, 'r', encoding='utf-8') as f: css = f.read()
with open(script_path, 'r', encoding='utf-8') as f: js = f.read()
with open(data_path, 'r', encoding='utf-8') as f: data = json.load(f)

# Inline CSS
html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>{css}</style>')

# Inline Data and modify script
data_js = f'const embeddedChipsData = {json.dumps(data, ensure_ascii=False)};'
new_js = js.replace("const response = await fetch('chips_data.json');", "")
new_js = new_js.replace("chipsData = await response.json();", "chipsData = embeddedChipsData;")

full_script = f'<script>\n{data_js}\n{new_js}\n</script>'
html = html.replace('<script src="script.js"></script>', full_script)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

docs_path = os.path.join(base_dir, 'docs', 'index.html')
with open(docs_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Successfully generated: {output_path}')
print(f'Successfully generated: {docs_path}')
