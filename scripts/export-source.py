"""Package the runnable project source without credentials or generated output."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
out=root/'public/cinebook-source.zip'
directories=['build','db','app','backend','components','hooks','lib','scripts','vendor','types','drizzle','public']
files=set()
for d in directories:
 for p in (root/d).rglob('*'):
  if p.is_file() and not any(x in {'target','node_modules','__pycache__'} for x in p.relative_to(root).parts) and p!=out: files.add(p)
for pattern in ['*.json','*.ts','*.mjs','*.yaml','README.md','.gitignore','.env.example']:
 files.update(p for p in root.glob(pattern) if p.is_file() and p.name!='tsconfig.tsbuildinfo')
with ZipFile(out,'w',ZIP_DEFLATED) as z:
 z.writestr('cinebook/.openai/hosting.json', '{"d1":null,"r2":null}\n')
 for p in sorted(files): z.write(p,Path('cinebook')/p.relative_to(root))
print(f'{len(files)} source files packaged ({out.stat().st_size} bytes)')
