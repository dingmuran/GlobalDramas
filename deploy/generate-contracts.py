#!/usr/bin/env python3
"""Generate framework-independent response types from actual Go JSON fields."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
source = (root / 'server/plugin/dramas/model/models.go').read_text()
output = ['// 根据 Go 业务模型生成；修改模型后运行 python3 deploy/generate-contracts.py。',
          "import type { DateTime, MoneyMinor } from './common'", '']
count = 0
for name, body in re.findall(r'type (\w+) struct \{(.*?)\n\}', source, re.S):
    extends = ' extends Base' if name != 'Base' else ''
    output.append(f'export interface {name}{extends} {{')
    for line in body.splitlines():
        match = re.search(r'\s*\w+\s+(\S+)\s+`json:"([^"]+)".*?`', line)
        if not match:
            if line.strip() and line.strip() != 'Base':
                raise SystemExit('Unsupported Go field: ' + line.strip())
            continue
        go_type, json_tag = match.groups()
        key, *options = json_tag.split(',')
        if key == '-':
            continue
        nullable = go_type.startswith('*')
        go_type = go_type.lstrip('*')
        types = {'string': 'string', 'bool': 'boolean', 'uint': 'number',
                 'int': 'number', 'int64': 'number', 'time.Time': 'DateTime'}
        if go_type not in types:
            raise SystemExit('Unsupported Go type: ' + go_type)
        ts_type = 'MoneyMinor' if 'string' in options and key.endswith('Minor') else types[go_type]
        if 'string' in options and ts_type == 'number':
            ts_type = 'string'
        if nullable:
            ts_type += ' | null'
        comment = re.search(r'comment:([^;"`]+)', line)
        if comment:
            output.append('  /** ' + comment.group(1).replace('*/', '') + ' */')
        output.append(f'  {key}: {ts_type}')
    output.extend(['}', ''])
    count += 1
assert count == 29, f'Expected Base and 28 business models, got {count}'
target = root / 'packages/contracts/src/models.ts'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text('\n'.join(output))
print(f'Generated {count - 1} business response types: {target}')
