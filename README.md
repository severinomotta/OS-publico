# OS — um sistema pessoal operado pelo Claude Code

Um "segundo cérebro" que se organiza sozinho. Você fala o que quiser (uma
tarefa, uma ideia, uma decisão, um arquivo) sem organizar nada antes, e o
Claude reconhece o que aquilo é, guarda no lugar certo e lembra por você.
Tudo fica numa pasta de arquivos de texto no seu computador, com cópia
num repositório privado seu no GitHub.

## A ideia que muda tudo: um Claude sem conversas

No app ou no site do Claude, você conversa. Cada conversa é uma ilha: o
que se decidiu numa fica perdido nas outras, e a conversa longa fica cada
vez mais cara (cada mensagem nova reenvia o histórico inteiro).

Aqui é o contrário. O Claude trabalha em cima de uma **wiki** (páginas de
texto) que é a memória do sistema. Tudo o que importa vai pra lá na hora.
A conversa é só a porta de entrada e pode ser apagada a qualquer momento
sem perder nada. Toda resposta termina com um selo que diz se pode:

- `✅ Clear liberado`: tudo gravado, pode apagar a conversa (`/clear`).
- `⏸ Discussão aberta: <assunto>`: ainda tem algo só na conversa.

### Por que começar pelo terminal (o "choque")

O sistema é montado e usado, no começo, pelo **Claude Code no terminal
do computador** (o "CLI"). Não é capricho técnico: é pra reeducar o
cérebro. Quem vê uma lista de conversas usa a lista de conversas: volta
na antiga, continua de onde parou, guarda coisa importante nela. No
terminal não existe lista nenhuma. Você abre, fala, o Claude grava na
wiki, você fecha. Esse choque é o que faz cair a ficha de que isto é um
Claude **sem conversas (pelo menos sem conversas visíveis)**, em que
quem lembra é o sistema.

Depois que o hábito pegar, o celular entra (seção "Fora do computador",
abaixo) e você opera o sistema de qualquer lugar.

## O que você precisa

- Uma assinatura do Claude (Pro ou acima).
- Um computador com Windows (este guia) ou Mac.
- Uma conta no GitHub (grátis): é onde fica a cópia espelhada e privada
  do seu sistema.

Não precisa saber programar. Você só faz os passos abaixo; daí em diante
o Claude instala o resto e explica cada coisa.

## Instalação, passo a passo (Windows)

Siga na ordem. Cada passo diz o que você vai ver na tela.

### Duas palavras antes

- **Terminal**: uma janela escura onde, em vez de clicar em botões, você
  escreve um comando e aperta Enter. No Windows ele se chama
  **PowerShell**. Você só vai usar pra três coisas: colar um comando de
  instalação, digitar `claude` e conversar com ele.
- **Pasta**: o terminal sempre "está" dentro de uma pasta do computador,
  e o Claude trabalha nos arquivos dessa pasta. Por isso o jeito de abrir
  o terminal ensinado aqui já abre ele **dentro da pasta certa**.

### Como abrir o terminal dentro de uma pasta

Você vai fazer isso várias vezes. Dois caminhos; use o que achar mais
fácil.

**Caminho A — pela barra de endereço (o mais garantido):**
1. Abra o **Explorador de Arquivos** (o ícone de pasta amarela na barra
   de tarefas, ou a tecla Windows + E).
2. Entre na pasta desejada com cliques duplos, como sempre faz.
3. Olhe a **barra de endereço**, lá em cima, que mostra onde você está
   (ex.: `Este Computador > Documentos`). Clique **uma vez** nela: o
   texto vira um caminho, tipo `C:\Users\Ana\Documents`, todo
   selecionado em azul.
4. Sem apagar nada antes (o que você digitar substitui o texto azul),
   escreva `powershell` e aperte **Enter**.
5. Abre uma janela escura. A última linha mostra o caminho da pasta e
   termina em `>`, tipo `PS C:\Users\Ana\Documents>`. Pronto: o terminal
   está dentro da pasta.

   Se você tiver o PowerShell mais novo instalado, pode escrever `pwsh`
   em vez de `powershell` (é mais curto). Se `pwsh` der erro ou não
   abrir nada, é porque ele não está instalado: use `powershell` por
   extenso, que sempre funciona.

**Caminho B — pelo botão direito (Windows 11):**
1. No Explorador, entre na pasta desejada.
2. Clique com o **botão direito** num espaço vazio da pasta (não em cima
   de um arquivo) e escolha **Abrir no Terminal**. Se não aparecer,
   clique antes em **Mostrar mais opções**.
3. Abre a mesma janela escura, já dentro da pasta.

### Passo 0 — Conferir que o Windows está na SUA conta

Tudo o que você instalar e todo login que fizer (Claude, GitHub) fica
guardado na conta do Windows que está aberta. Se o computador é
compartilhado e está logado na conta de outra pessoa, o seu sistema
nasce misturado com as contas dela.
1. Abra o terminal em qualquer pasta (Caminho A ou B acima).
2. Escreva `whoami` e aperte **Enter**.
3. Aparece algo como `nome-do-pc\ana`. A parte depois da barra tem que
   ser **você**. Se for o nome de outra pessoa, pare aqui e crie a sua
   conta no Windows: Configurações → Contas → Outros usuários (ou
   "Família e outros usuários") → Adicionar conta. Depois entre nela
   (menu Iniciar → foto do usuário → sua conta) e recomece deste passo.

### Passo 1 — Instalar o Git for Windows

É o programa que guarda o histórico do seu sistema e faz o espelho com o
GitHub.
1. Abra https://git-scm.com/downloads/win e clique no primeiro link de
   download ("Click here to download").
2. Abra o arquivo baixado. Se o Windows perguntar "Deseja permitir que
   este aplicativo faça alterações?", clique **Sim**.
3. O instalador mostra várias telas em inglês. **Não mude nada**: vá
   clicando **Next** até aparecer **Install**, clique, espere e clique
   **Finish**.

### Passo 2 — Instalar o Claude Code

1. Abra o terminal na pasta **Documentos** (Caminho A ou B acima).
2. Copie esta linha inteira:

   ```
   irm https://claude.ai/install.ps1 | iex
   ```
3. Clique dentro da janela escura e cole com **Ctrl+V** (ou clique com o
   botão direito). Aperte **Enter**.
4. Espere. Aparecem algumas linhas de texto e, no fim, a mensagem de que
   a instalação terminou. Se aparecer erro em vermelho, tire uma foto da
   tela e confira a página oficial: https://code.claude.com/docs/en/setup.
5. Confira a linha **Location**: o caminho tem que ter o seu nome de
   usuário (ex.: `C:\Users\ana\.local\bin\claude.exe`). Se tiver o nome
   de outra pessoa, volte ao Passo 0.
6. Se aparecer um aviso amarelo **"Setup notes"** dizendo que
   `...\.local\bin is not in your PATH`, o Windows ainda não sabe onde o
   programa está e não vai achar o comando `claude`. Copie esta linha
   inteira, cole na mesma janela e aperte **Enter** (não aparece nada,
   é normal):

   ```
   [Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";$env:USERPROFILE\.local\bin", "User")
   ```
7. **Feche a janela** (no X, como qualquer janela). É necessário: a
   janela que estava aberta durante a instalação não "sabe" que o
   programa novo existe.

### Passo 3 — Entrar na sua conta

1. Abra de novo o terminal na pasta **Documentos** (Caminho A ou B).
2. Escreva `claude` e aperte **Enter**.
3. Na primeira vez ele faz umas perguntas. Escolha com as **setas** do
   teclado e confirme com **Enter**:
   - tema de cores: tanto faz, só Enter;
   - forma de entrar: **Claude account with subscription** (a sua
     assinatura do Claude);
   - o navegador abre sozinho: entre na sua conta do Claude, clique em
     **Autorizar** e volte pra janela escura;
   - "Do you trust the files in this folder?": **Yes**.
4. Aparece uma caixa pra escrever. Isso é o Claude Code. Daqui pra
   frente é só escrever em português, como numa conversa.

### Passo 4 — Pedir a instalação do sistema

Cole esta frase na caixa e aperte Enter:

> Instala o OS a partir de https://github.com/severinomotta/OS-publico,
> seguindo o arquivo docs/instalacao.md de lá.

Daí em diante o Claude conduz: liga a sua conta do GitHub, cria a sua
cópia na pasta Documentos e o espelho privado no GitHub, faz uma
entrevista curta pra conhecer você e ensina como usar. Quando ele pedir
permissão pra rodar alguma coisa, ele explica o que é; pode aceitar.

No meio do caminho ele vai pedir pra você fechar a janela e abrir o
terminal **dentro da pasta nova do sistema** (que ele criou dentro de
Documentos). É o mesmo Caminho A ou B, só que entrando nessa pasta.

## Uso de todo dia, no computador

1. Explorador de Arquivos → Documentos → pasta do seu sistema.
2. Abrir o terminal ali (Caminho A ou B).
3. Escrever `claude` e Enter.
4. Um assunto por vez. Quando a resposta terminar com
   `✅ Clear liberado`, escreva `/clear` e Enter (zera a conversa; nada
   se perde) e siga pro próximo assunto, ou feche a janela.

## Fora do computador: o app do Claude no celular

Com o sistema já em uso no computador, o Claude te ensina a ligar o
celular (página `wiki/Captura-pelo-Celular.md`). Daí, quando você não estiver
no PC, abre o app do Claude, vai na parte **Code**, escolhe o
repositório do seu sistema e opera o sistema **como se estivesse no
computador**: anotar, perguntar o que tem pra fazer, mexer num projeto.
Tudo fica gravado no seu repositório do GitHub, e na próxima vez que você
abrir o `claude` no computador ele sincroniza sozinho.

A regra do `/clear` vale lá também, e ela é **contraintuitiva**: quando
aparecer `✅ Clear liberado`, **arquive ou apague aquela conversa e, da
próxima vez, comece uma conversa nova**. Nunca volte numa conversa
antiga pra continuar. Quem está acostumado com chatbot sente que vai
perder tudo. Não perde: o ✅ só aparece quando tudo o que importava já
foi gravado no sistema, e a conversa nova lê de lá. Voltar na velha só
deixa cada mensagem mais cara e mais lenta. Confie no selo e faça: é o
hábito que faz o sistema funcionar.

## O que tem aqui

| Caminho | O que é |
|---|---|
| `CLAUDE.md` | O contrato: as regras que o Claude segue no seu sistema. Lido em toda mensagem. |
| `docs/arquitetura.md` | O porquê de cada regra: o problema que cada peça resolve. |
| `docs/instalacao.md` | O roteiro que o Claude segue pra instalar. |
| `wiki/` | As páginas. Vêm só as que fazem o sistema funcionar; as suas nascem com o uso. |
| `.claude/hooks/` | Três scripts que rodam sozinhos: carregam o mapa das suas tarefas, medem o tamanho da conversa e sincronizam com o GitHub. |
| `scripts/google/` | Robô opcional pra o Claude operar o seu Google (Drive, Planilhas, Agenda, Docs, Gmail) direto pela API. |
| `scripts/grafo/` | Script que sugere conexões entre as páginas da wiki. |

## Privacidade

O seu vault é seu: fica no seu computador e num repositório **privado** da
sua conta do GitHub. Este repositório é só o modelo de partida: nada do
que você escrever volta pra cá.
