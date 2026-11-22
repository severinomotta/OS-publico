# Roteiro de instalação (pro Claude Code seguir)

Este arquivo é instrução pro Claude, não pro usuário. O usuário colou uma
frase pedindo pra instalar o OS a partir deste repositório. Você conduz
tudo, explicando cada passo do zero (sem supor que ele programa), e só
pede ação manual quando ela exige o navegador logado numa conta dele.

**Regra desta instalação: tudo pelo Claude Code no terminal, com o vault
no PC e espelhado num repositório privado no GitHub.** O terminal é de
propósito um choque: sem lista de conversas visível, o usuário aprende
na prática que a memória é o vault, não a conversa (README, "Por que
começar pelo terminal"). O celular só entra na Fase 3, com o sistema já
em uso.

**Instrução de terminal é sempre pra leigo absoluto.** Nunca diga só
"abra o terminal na pasta" ou "dê `cd`": descreva o caminho inteiro,
como no README ("Como abrir o terminal dentro de uma pasta"):
Explorador de Arquivos → entrar na pasta → clicar uma vez na barra de
endereço → escrever `powershell` (ou `pwsh`, se o PowerShell novo
estiver instalado; se `pwsh` não abrir, `powershell` por extenso) →
Enter → escrever `claude` → Enter. Alternativa no Windows 11: botão
direito num espaço vazio da pasta → "Abrir no Terminal" (talvez dentro
de "Mostrar mais opções").

## Fase 1 — fora do vault (a sessão foi aberta numa pasta qualquer)

1. **Ambiente.** Conferir o que existe: `git`, `node` (os hooks são
   JavaScript), `python` (robô Google e scripts) e `gh` (GitHub CLI).
   Instalar o que faltar com o gerenciador do sistema (`winget` no
   Windows, `brew` no Mac, o da distribuição no Linux), mostrando o
   comando e esperando o "pode". No Windows sem Git for Windows: parar e
   pedir pra instalar (git-scm.com/downloads/win), porque os hooks rodam
   no Git Bash.
2. **GitHub primeiro.** O modelo é público, mas o vault do usuário
   nasce como repositório privado na conta dele, então o login vem
   antes. Conferir se o usuário tem conta no GitHub (se não, guiar a
   criação em github.com). Rodar
   `gh auth login` explicando o que vai aparecer: escolher GitHub.com,
   HTTPS, entrar pelo navegador; o terminal mostra um código de 8
   letras, o navegador abre, o usuário cola o código e autoriza.
3. **Nome do vault.** Perguntar como o usuário quer chamar o sistema (ex.:
   "Ana's OS") e a pasta (ex.: `AnaOS-vault`). Sem preferência, sugerir.
4. **Cópia sem histórico.** Clonar este repositório na pasta escolhida
   (dentro de Documentos),
   apagar a pasta `.git` do clone e começar um repositório novo
   (`git init -b main`), com um primeiro commit "Nascimento do <nome>".
   O vault do usuário não carrega o histórico do modelo.
5. **Espelho no GitHub.**
   `gh repo create <pasta> --private --source . --push`. Conferir que o
   repositório nasceu **privado**.
6. **Envio a cada commit.** Copiar `docs/opcional/post-commit` pra
   `.git/hooks/post-commit` e dar permissão de execução: todo commit vai
   pro GitHub na hora, em segundo plano.
7. **Trocar de pasta.** Explicar que o contrato e os hooks só valem com o
   Claude Code aberto **dentro** da pasta do vault. Passar o roteiro
   completo, em lista numerada: fechar esta janela no X; abrir o
   Explorador de Arquivos; Documentos; dois cliques na pasta `<pasta>`;
   abrir o terminal ali (barra de endereço + `powershell`, ou botão
   direito + "Abrir no Terminal"); escrever `claude` e Enter; responder
   **Yes** em "trust this folder"; escrever "continua a instalação".

## Fase 2 — dentro do vault

Ao abrir, o hook `SessionStart` deve ter injetado o mapa das listas
(vazio). Se não veio, diagnosticar antes de seguir (node no PATH, Git
Bash no Windows).

8. **Entrevista.** Uma pergunta por vez, sem formulário. Preencher com as
   palavras do usuário:
   - [[Perfil]]: nome e como quer ser chamado, o que faz, interesses,
     objetivos pros próximos meses, pessoas que vão aparecer nas
     conversas.
   - `CLAUDE.md`: "Fronteiras" (o que nunca entra no vault; sem nada,
     apagar a seção), "Como o usuário pensa", idioma, nível técnico e
     outras preferências de resposta. Conferir com ele o padrão de
     lembretes do Calendar.
   - Nada de criar página de área ("Trabalho", "Estudos") vazia: área
     nasce quando o primeiro conteúdo real chegar.
9. **Aula de tokens** ([[Guia-de-Tokens]]): o que é contexto, por que
   conversa longa custa mais, o selo, `/clear`, `/usage`, `/context`.
   Mostrar o selo funcionando nesta própria sessão. Perguntar o plano do
   usuário e ajustar os níveis do medidor se for preciso
   (`.claude/hooks/user-prompt-submit.js`, explicação no Guia).
10. **Conectores (opcional).** Em claude.ai → Configurações → Conectores,
   o usuário pode ligar Gmail, Google Calendar e Google Drive. Eles
   aparecem aqui no Claude Code também. É configuração de conta, não
   conversa: o chat do site não é usado.
11. **Primeira captura.** Pedir pro usuário falar qualquer coisa que tenha
    na cabeça (uma tarefa, uma ideia). Arquivar no lugar certo, commitar,
    mostrar o selo `✅` e explicar que agora a conversa pode ser apagada
    (`/clear`). Ensinar o uso de todo dia com o roteiro completo do
    Explorador (README, "Uso de todo dia, no computador").
12. **Registrar o nascimento.** Preencher o "Estado atual" de [[OS]] e a
    primeira entrada do histórico de [[Manutencao-do-Contrato]] (data,
    campos preenchidos na entrevista). Commit.
13. **O que fica pra depois** (não fazer agora; contar que existe):
    - O celular (Fase 3).
    - Robô Google, pra operar Drive/Planilhas/Agenda por API: [[Robo-Google]].

## Fase 3 — o celular, com o sistema já em uso

Quando o usuário já estiver usando o sistema no computador (ou pedir),
ligar o celular seguindo [[Captura-pelo-Celular]]. Explicar o que muda:
fora do PC, ele abre o app do Claude, parte **Code**, escolhe o
repositório do vault e opera o sistema como se estivesse no computador;
tudo fica gravado no GitHub e o `claude` do PC sincroniza na abertura.

Ensinar junto o hábito da nuvem, com o porquê, porque é contraintuitivo
pra quem vem de chatbot: com `✅ Clear liberado`, arquivar ou apagar a
conversa e sempre começar uma nova; nunca voltar numa antiga pra
continuar. Pedir que confie no selo e faça, mesmo parecendo errado.

## Depois da instalação

Este arquivo pode ficar: serve de referência se algo precisar ser
refeito. O README pode ser trocado por uma descrição do sistema do
usuário, se ele quiser.
