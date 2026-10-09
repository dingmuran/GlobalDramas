#!/usr/bin/env python3
"""Interactively initialize a fresh local Docker database via the Go API."""
import getpass
import json
from pathlib import Path
import sys
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
def call(path, payload):
    request = urllib.request.Request('http://127.0.0.1:8888' + path,
        data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(request, timeout=180) as response:
        result = json.load(response)
    if result.get('code') != 0:
        sys.exit(result.get('msg', '初始化失败'))
    return result

if __name__ == '__main__':
    if not call('/init/checkdb', {}).get('data', {}).get('needInit'):
        sys.exit('数据库已初始化，未修改现有账号或数据。')
    env = dict(line.split('=', 1) for line in (ROOT / '.env.local').read_text().splitlines()
        if '=' in line and not line.startswith('#'))
    password = getpass.getpass('新超级管理员密码（12–72字节）：')
    if not 12 <= len(password.encode()) <= 72:
        sys.exit('密码长度必须为12–72字节。')
    if password != getpass.getpass('再次输入密码：'):
        sys.exit('两次密码不一致。')
    result = call('/init/initdb', {'dbType': 'pgsql', 'host': 'postgres', 'port': '5432',
        'userName': env['POSTGRES_USER'], 'password': env['POSTGRES_PASSWORD'],
        'dbName': 'global_dramas_admin', 'adminPassword': password})
    print(result.get('msg', '初始化完成') + '；使用admin登录后台。')
