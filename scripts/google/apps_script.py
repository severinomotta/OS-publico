"""
Apps Script pela API, sem clasp - serve no PC e na nuvem (credencial do
drive_client.py). Guia: wiki/Robo-Google.md.

  python scripts/apps_script.py push <pasta com .clasp.json>
  python scripts/apps_script.py run  <pasta com .clasp.json> <funcao> ['[arg1, arg2]']

push = equivalente ao `clasp push`: substitui TODO o codigo do projeto pelos
.js/.gs/.html + appsscript.json da pasta (o que so existe no editor se perde).
run = scripts.run com devMode (roda o HEAD, sem precisar de deployment novo).
Conta: roda na conta padrao do drive_client.py; OS_CONTA=<outra> na frente
do comando roda como aquela conta, inclusive gatilho instalado por funcao
(o gatilho nasce sob quem chama).
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drive_client import _creds  # noqa: E402
from googleapiclient.discovery import build  # noqa: E402
import google_auth_httplib2  # noqa: E402
import httplib2  # noqa: E402

# scripts.run espera a funcao terminar (teto do Apps Script: 6 min); o padrao
# do googleapiclient (60s) corta antes
TIMEOUT = 400


def _svc():
    http = google_auth_httplib2.AuthorizedHttp(_creds(), http=httplib2.Http(timeout=TIMEOUT))
    return build("script", "v1", http=http)


TIPOS = {".js": "SERVER_JS", ".gs": "SERVER_JS", ".html": "HTML"}


def _projeto(pasta):
    with open(os.path.join(pasta, ".clasp.json"), encoding="utf-8") as f:
        cfg = json.load(f)
    return cfg["scriptId"], os.path.join(pasta, cfg.get("rootDir") or "")


def push(pasta):
    script_id, raiz = _projeto(pasta)
    files = []
    for nome in sorted(os.listdir(raiz)):
        base, ext = os.path.splitext(nome)
        if nome == "appsscript.json":
            tipo = "JSON"
        elif ext in TIPOS:
            tipo = TIPOS[ext]
        else:
            continue
        with open(os.path.join(raiz, nome), encoding="utf-8") as f:
            files.append({"name": base, "type": tipo, "source": f.read()})
    if not any(f["type"] == "JSON" for f in files):
        raise RuntimeError(f"appsscript.json nao encontrado em {raiz}")
    svc = _svc()
    svc.projects().updateContent(scriptId=script_id, body={"files": files}).execute()
    print(f"push ok: {len(files)} arquivos -> {script_id}")


def run(pasta, funcao, params=None):
    script_id, _ = _projeto(pasta)
    body = {"function": funcao, "devMode": True}
    if params:
        body["parameters"] = params
    svc = _svc()
    resp = svc.scripts().run(scriptId=script_id, body=body).execute()
    if "error" in resp:
        print(json.dumps(resp["error"], ensure_ascii=False, indent=2))
        sys.exit(1)
    print(json.dumps(resp.get("response", {}).get("result"), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    cmd, pasta = sys.argv[1], sys.argv[2]
    if cmd == "push":
        push(pasta)
    elif cmd == "run":
        run(pasta, sys.argv[3], json.loads(sys.argv[4]) if len(sys.argv) > 4 else None)
    else:
        sys.exit(__doc__)
