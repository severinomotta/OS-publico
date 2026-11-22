"""
Robô Google do OS: conexão direta Python -> APIs do Google (Drive,
Planilhas, Agenda, Docs, Forms, Gmail, Apps Script), sem passar pelo
conector/MCP.
Guia: wiki/Robo-Google.md.

Por que existe se já tem conector: o conector serve pra consulta pontual;
o robô faz trabalho em lote (subir 50 arquivos, ler uma planilha inteira,
rodar função de Apps Script) sem passar cada byte pelo contexto do Claude —
mais barato em tokens e sem limite de formato.

Credenciais moram FORA do vault (nunca versionadas):
  ~/.credentials/os-google/client_secret.json        (baixado do Google Cloud)
  ~/.credentials/os-google/token.json                (criado no 1º login)
  ~/.credentials/os-google/email-principal.txt       (e-mail da conta, gravado no 1º login)
  ~/.credentials/os-google/client_secret_nuvem.json  (opcional, pra nuvem)

Teste: python scripts/google/drive_client.py  -> "Autenticado como: ..."
"""

import io
import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/forms",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/script.scriptapp",
    "https://www.googleapis.com/auth/script.deployments",
    "https://www.googleapis.com/auth/script.projects",
    "https://www.googleapis.com/auth/script.processes",
    "https://www.googleapis.com/auth/script.external_request",
]
CRED_DIR = os.path.join(os.path.expanduser("~"), ".credentials", "os-google")
CLIENT_SECRET_PATH = os.path.join(CRED_DIR, "client_secret.json")

# Conta Google da execução. Padrão: "principal". Outra conta (ex.: a do
# trabalho) roda com OS_CONTA=<nome> na frente do comando — mesmo client
# OAuth pra todas. Cada conta tem o seu token no PC, a sua variável de
# ambiente na nuvem e o e-mail esperado, gravado no primeiro login (fora do
# vault: o repositório não carrega dado pessoal).
CONTA = os.environ.get("OS_CONTA", "principal")
if not CONTA.replace("-", "").replace("_", "").isalnum():
    raise RuntimeError(f"OS_CONTA invalida: {CONTA} (use letras, numeros, - ou _)")
_SUFIXO = "" if CONTA == "principal" else f"-{CONTA}"
TOKEN_PATH = os.path.join(CRED_DIR, f"token{_SUFIXO}.json")
EMAIL_PATH = os.path.join(CRED_DIR, f"email-{CONTA}.txt")
VAR_NUVEM = "OS_GOOGLE_TOKEN_JSON" + ("" if CONTA == "principal" else "_" + CONTA.upper().replace("-", "_"))


def _login(client_secret_path):
    flow = InstalledAppFlow.from_client_secrets_file(client_secret_path, SCOPES)
    esperado = open(EMAIL_PATH).read().strip() if os.path.exists(EMAIL_PATH) else None
    print(f"Login Google (conta '{CONTA}'): entrar " +
          (f"como {esperado}" if esperado else "na conta desejada") + " no link abaixo.", flush=True)
    creds = flow.run_local_server(port=0, open_browser=False)
    # Token de uma conta gravado no arquivo de outra faria tudo rodar
    # na conta errada sem ninguem perceber: confere antes de salvar.
    email = build("drive", "v3", credentials=creds).about().get(
        fields="user(emailAddress)").execute()["user"]["emailAddress"]
    if esperado and email.lower() != esperado.lower():
        raise RuntimeError(f"Login feito como {email}, esperado {esperado}. Nada salvo.")
    if not esperado:
        os.makedirs(CRED_DIR, exist_ok=True)
        with open(EMAIL_PATH, "w") as f:
            f.write(email)
    return creds


def gerar_token_nuvem():
    """No PC: gera o token da conta OS_CONTA com o client "Claude Nuvem" e
    salva em token-nuvem[-conta].json. O conteudo vai pra variavel VAR_NUVEM
    do ambiente da nuvem."""
    creds = _login(os.path.join(CRED_DIR, "client_secret_nuvem.json"))
    nome = f"token-nuvem{_SUFIXO}.json"
    with open(os.path.join(CRED_DIR, nome), "w") as f:
        f.write(creds.to_json())
    print(f"Salvo {nome}: colar o conteudo na variavel {VAR_NUVEM} da nuvem.")


def _creds():
    creds = None
    # Nuvem: o token vem da variavel de ambiente da conta (cliente "Claude
    # Nuvem", separado do PC - wiki/Robo-Google.md)
    cloud_token = os.environ.get(VAR_NUVEM)
    if cloud_token and not os.path.exists(TOKEN_PATH):
        os.makedirs(CRED_DIR, exist_ok=True)
        with open(TOKEN_PATH, "w") as f:
            f.write(cloud_token)
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Na nuvem ninguem clica no link: falhar na hora em vez de pendurar
            if os.environ.get("CLAUDE_CODE_REMOTE") == "true":
                raise RuntimeError(
                    f"Token Google de {CONTA} ausente ou revogado na nuvem: gerar de novo no PC "
                    f"(gerar_token_nuvem) e atualizar {VAR_NUVEM} no ambiente.")
            creds = _login(CLIENT_SECRET_PATH)
        with open(TOKEN_PATH, "w") as f:
            f.write(creds.to_json())
    return creds


def _service():
    return build("drive", "v3", credentials=_creds())


def sheets_service():
    """Sheets API com a mesma credencial -- escopo 'drive' já cobre leitura/escrita
    de planilha (não precisa de escopo 'spreadsheets' separado)."""
    return build("sheets", "v4", credentials=_creds())


def find_child(parent_id: str, name: str, folder: bool = False):
    """Acha um arquivo/pasta pelo nome exato dentro de uma pasta. None se nao existir."""
    svc = _service()
    mime_clause = " and mimeType = 'application/vnd.google-apps.folder'" if folder else ""
    q = f"'{parent_id}' in parents and name = '{name}' and trashed = false{mime_clause}"
    res = svc.files().list(q=q, fields="files(id, name)", pageSize=1).execute()
    files = res.get("files", [])
    return files[0]["id"] if files else None


def ensure_folder(parent_id: str, name: str) -> str:
    """Acha a subpasta pelo nome ou cria se nao existir. Retorna o ID."""
    existing = find_child(parent_id, name, folder=True)
    if existing:
        return existing
    svc = _service()
    meta = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }
    return svc.files().create(body=meta, fields="id").execute()["id"]


def export_file(file_id: str, dest_path: str, mime_type: str):
    """Exporta um arquivo nativo do Google (Sheets/Docs) pro formato pedido
    (ex.: xlsx pra pegar TODAS as abas de uma planilha de uma vez -- o export
    direto pra csv só traz a primeira aba)."""
    svc = _service()
    request = svc.files().export_media(fileId=file_id, mimeType=mime_type)
    with io.FileIO(dest_path, "wb") as fh:
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
    return dest_path


def download_file(file_id: str, dest_path: str):
    """Baixa um arquivo do Drive direto pro disco (sem passar pelo contexto do Claude)."""
    svc = _service()
    request = svc.files().get_media(fileId=file_id)
    with io.FileIO(dest_path, "wb") as fh:
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
    return dest_path


def download_by_name(parent_id: str, name: str, dest_path: str):
    """Acha pelo nome dentro de uma pasta e baixa. Levanta FileNotFoundError se nao achar."""
    file_id = find_child(parent_id, name)
    if not file_id:
        raise FileNotFoundError(f"'{name}' nao encontrado na pasta {parent_id}")
    return download_file(file_id, dest_path)


def upload_file(local_path: str, parent_id: str, name: str | None = None, overwrite: bool = True):
    """Sobe um arquivo local pro Drive. Se ja existir um com o mesmo nome na pasta
    e overwrite=True, atualiza o conteudo (mesmo file ID) em vez de duplicar."""
    svc = _service()
    name = name or os.path.basename(local_path)
    media = MediaFileUpload(local_path, resumable=True)

    existing_id = find_child(parent_id, name) if overwrite else None
    if existing_id:
        return svc.files().update(fileId=existing_id, media_body=media).execute()["id"]

    meta = {"name": name, "parents": [parent_id]}
    return svc.files().create(body=meta, media_body=media, fields="id").execute()["id"]


if __name__ == "__main__":
    # Teste de autenticacao: só dispara o consentimento no navegador e confirma
    # que a API responde (lista o proprio drive raiz).
    svc = _service()
    about = svc.about().get(fields="user").execute()
    print("Autenticado como:", about["user"]["emailAddress"])
