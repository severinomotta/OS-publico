Convenções pra quando o sistema tiver Apps Script (código que roda dentro de uma planilha, Doc ou Form do Google). **Ler antes de escrever código de Apps Script ou mandar rodar função** ([[CLAUDE]]). Cada convenção nasceu de um tropeço repetido em sistemas de planilha reais. Contexto: [[Robo-Google]].

## Rodar função: pela API, e quando não der, nomear planilha e arquivo

O padrão é eu rodar a função direto pela API ([[Robo-Google]]). Quando isso travar e o usuário precisar rodar no editor, a frase vem sempre no formato **"Na planilha X, Arquivo.gs → função()"**. Por quê: o seletor de função do editor só lista as funções do arquivo aberto. Sem o arquivo, a pessoa caça função arquivo por arquivo; sem a planilha, pode estar no projeto errado.

## Sem popup bloqueante em função de editor

Função que roda pelo editor nunca usa `Browser.msgBox`/`SpreadsheetApp.getUi().alert`: o popup aparece na aba da **planilha**, não no editor, e a execução fica "rodando pra sempre" esperando um clique que ninguém vê. Feedback com `Logger.log` ou `toast`; erro de precondição com `throw new Error(...)`.

**Exceção deliberada**: confirmação Sim/Não antes de ação destrutiva (apagar linhas) pode usar `ui.alert`, mas só em função que **só** roda pelo menu, com a exceção documentada no comentário da função.

## Bootstrap não vai pro menu

Função de setup/migração pontual roda pelo editor (ou pela API), nunca vira `.addItem` no `onOpen()`. O menu da planilha é interface de uso diário; função de uso único ali é convite pra alguém rodar migração por engano.
