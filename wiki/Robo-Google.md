Módulo opcional: o robô Python que deixa o Claude operar o Google do usuário direto pela API (Drive, Planilhas, Agenda, Docs, Forms, Gmail e Apps Script). Código: `scripts/google/drive_client.py` e `scripts/google/apps_script.py`. Contexto: [[OS]], [[Convencoes-Apps-Script]].

## Estado atual

⟪preencher: "não instalado" / "instalado no PC" / "instalado no PC e na nuvem"; conta; projeto no Google Cloud; modo do app OAuth⟫

## Conector × robô: por que ter os dois

Os **conectores** do claude.ai (Gmail, Agenda, Drive) já deixam o Claude ler e-mail, ver a agenda e achar arquivo, sem instalar nada. Servem pra consulta pontual. O **robô** é pra trabalho de verdade:

- **Em lote e fora do contexto**: ler uma planilha de 5 mil linhas, subir 50 fotos pro Drive, renomear 200 arquivos. O robô faz no Python e devolve só o resumo; pelo conector cada byte passaria pela conversa (caro, e às vezes nem cabe).
- **O que o conector não faz**: criar e formatar planilha, escrever em Doc, criar formulário, rodar e instalar código de Apps Script, gatilhos automáticos (uma planilha que se atualiza sozinha toda noite).
- **Sem Chrome**: quase tudo que se faria clicando no Google, o robô faz por API, por uma fração dos tokens ([[Protocolo-Chrome]]).

## Coisas que dá pra pedir

- "Cria uma planilha de gastos do mês com categorias e um gráfico por categoria."
- "Pega todas as fotos da pasta X do Drive e organiza por mês em subpastas."
- "Lê essa planilha e me diz o que mudou desde a semana passada."
- "Monta um formulário de inscrição e liga as respostas numa planilha."
- "Faz uma planilha que me manda e-mail toda segunda com o que vence na semana" (Apps Script + gatilho).

## Instalação (uma vez, no PC)

O Claude conduz; o usuário só faz o que exige o navegador logado na conta Google.

1. **Projeto no Google Cloud**: em console.cloud.google.com, logado na conta Google, aceitar os termos e criar um projeto. Grátis: as APIs usadas aqui não pedem cartão.
2. **Ligar as 7 APIs** do projeto: Drive, Sheets, Calendar, Docs, Forms, Gmail e Apps Script. O Claude manda o link direto de cada uma (`console.cloud.google.com/apis/library/<api>.googleapis.com?project=<projeto>`); é um clique em "Ativar".
3. **Tela de consentimento** (Google Auth Platform): nome do app, e-mail de suporte, público **Externo**, e em Público-alvo adicionar a própria conta como usuário de teste.
4. **Credencial**: Clientes → Criar cliente → tipo **App para computador** → baixar o JSON. O Claude move o arquivo pra `~/.credentials/os-google/client_secret.json` (fora do vault: credencial nunca vai pro git).
5. **Apps Script API no nível da conta**: ligar em script.google.com/home/usersettings (sem isso, rodar Apps Script pela API dá erro de permissão).
6. **Bibliotecas**: `pip install google-api-python-client google-auth-oauthlib google-auth-httplib2` (o Claude roda).
7. **Primeiro login**: o Claude roda `python scripts/google/drive_client.py`, que mostra um link. O usuário abre, entra na conta, vê "O Google não verificou este app" (normal: o app é só dele) → **Continuar** → marca todas as permissões. Resultado: `Autenticado como: <e-mail>`. O e-mail fica gravado em `~/.credentials/os-google/` e todo login seguinte é conferido contra ele, pra o robô nunca rodar na conta errada.

**Mais de uma conta Google** (ex.: pessoal e de trabalho): mesmo projeto, mesma credencial. Rodar com `OS_CONTA=<nome>` na frente do comando; o primeiro login de cada nome grava o e-mail daquela conta.

## O teto de 7 dias (modo "Testando")

App em modo "Testando" tem o login vencido a cada 7 dias. Pro uso sob demanda isso custa um clique por semana: quando o robô reclamar de token, o Claude apaga o `token.json`, roda de novo e manda o link. **Atrapalha de verdade** quando houver gatilho automático ou robô na nuvem: aí vale publicar o app ("Em produção", sem verificação), o que exige página inicial e política de privacidade num domínio verificado no Search Console.

## Robô na nuvem (opcional, depois)

Pra sessão do celular também operar o Google: criar um segundo cliente (mesmo tipo), salvar como `client_secret_nuvem.json`, rodar no PC `python -c "import sys; sys.path.insert(0,'scripts/google'); import drive_client as d; d.gerar_token_nuvem()"` e colar o conteúdo do `token-nuvem.json` gerado na variável `OS_GOOGLE_TOKEN_JSON` do ambiente da nuvem (claude.ai/code → ambiente → variáveis de ambiente). Credencial separada da do PC: se vazar, revoga só ela. Com o app em "Testando", esse token também morre em 7 dias.

## Apps Script pela API

- `python scripts/google/apps_script.py push <pasta>`: sobe o código de uma pasta (com `.clasp.json` + `appsscript.json`) pro projeto, substituindo tudo.
- `python scripts/google/apps_script.py run <pasta> <função> ['[args]']`: roda a função e devolve o resultado.
- Pro `run` funcionar, três peças: o projeto de Apps Script ligado ao mesmo projeto do Google Cloud (editor → Configurações do projeto → número do projeto), `"executionApi": {"access": "MYSELF"}` no `appsscript.json`, e a Apps Script API ligada na conta (passo 5). Gatilho instalado por função roda sob a conta que chamou. Sem essas três, o caminho é rodar função na mão pelo editor, e é fácil passar meses assim sem saber que existe rota.
