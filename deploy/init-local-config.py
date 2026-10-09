#!/usr/bin/env python3
"""Generate private local Docker configuration without requiring a local Go installation."""
from pathlib import Path
import secrets
import sys

root = Path(__file__).resolve().parents[1]
env = root / '.env.local'
config = root / 'server/config.local.yaml'
if env.exists() or config.exists():
    sys.exit('本地配置已存在，未覆盖。现有环境可直接使用 docker compose 启动。')
password = secrets.token_hex(24)
jwt_key = secrets.token_hex(32)
text = (root / 'server/config.docker.example.yaml').read_text()
text = text.replace('__POSTGRES_PASSWORD__', password).replace('__JWT_SIGNING_KEY__', jwt_key)
env.write_text(f'POSTGRES_USER=global_dramas\nPOSTGRES_PASSWORD={password}\nPOSTGRES_DB=postgres\n')
config.write_text(text)
env.chmod(0o600)
config.chmod(0o600)
print('已生成 .env.local 和 server/config.local.yaml，密码未输出。')
print('运行 docker compose -f compose.local.yaml up -d 后执行 python3 deploy/bootstrap-local-database.py 完成首次初始化。')
