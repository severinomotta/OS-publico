Módulo pra operar o sistema fora do computador: pelo app do Claude no celular, parte **Code**, numa sessão na nuvem que trabalha no espelho do vault no GitHub. Liga-se depois que o sistema já está em uso no PC. A regra operante está no [[CLAUDE]] ("Onde o sistema vive"). Contexto: [[OS]].

## Estado atual

⟪preencher quando ligar: data e o que foi testado⟫

## Operar o sistema como se estivesse no computador

Fora do PC, a sessão no celular faz o mesmo que o `claude` do computador: anotar (ditando ou digitando), perguntar o que tem pra fazer, mexer num projeto. Tudo é gravado e commitado no GitHub, e o PC junta na próxima abertura (seção de sincronia abaixo).

**Hábito: com `✅ Clear liberado`, arquivar ou apagar a sessão, e sempre começar uma nova.** A lista de sessões do app não é arquivo de nada. É contraintuitivo pra quem vem de chatbot (parece que vai perder tudo), mas o selo só aparece com tudo gravado no vault, e a sessão nova lê de lá. Sessão velha reaberta só fica mais cara e mais lenta. Se der vontade de voltar numa sessão antiga pra lembrar algo, é sinal de que algo não foi registrado: registrar no vault, não reabrir. Vale igual pro claude.ai/code no navegador.

## Como ligar (o Claude conduz, no PC)

1. No Claude Code do PC, rodar `/web-setup`: liga a conta do GitHub à conta do Claude, pra nuvem conseguir clonar o vault.
2. No celular, instalar o app do Claude, entrar com a mesma conta, abrir a aba **Code** e escolher o repositório do vault.
3. Teste: ditar uma nota curta, conferir que ela entrou no vault e que o PC juntou na abertura da sessão seguinte.

## Como funciona a sincronia

- Cada sessão na nuvem roda numa máquina temporária da Anthropic, que clona o repositório, trabalha e grava num **branch próprio** `claude/...`, não no principal (a nuvem pode não ter permissão de gravar direto nele).
- **No PC**, ao abrir sessão, o hook `.claude/hooks/sync-git.js` traz o principal do GitHub, incorpora todo branch `claude/*`, manda de volta e apaga os branches incorporados. O `.git/hooks/post-commit` manda cada commit do PC pro GitHub na hora, pra nuvem nunca ler uma wiki velha.
- **Na nuvem**, o mesmo hook incorpora os `claude/*` anteriores no branch da sessão, pra nota nova enxergar as que o PC ainda não juntou.
- **Conflito nunca se resolve sozinho**: o merge daquele branch é desfeito, o branch continua no GitHub e o aviso aparece em toda sessão até alguém resolver.
- **Sem sincronia no meio da sessão, de propósito**: só na abertura. Mandou algo pelo celular com uma sessão do PC aberta? Basta avisar no PC ("mandei uma nota pelo celular") e o Claude faz `git fetch` + merge na hora.

## Custo

Uma nota ditada quase não pesa (um minuto falado dá uns 200–250 tokens). O que pesa é abrir cada sessão, que carrega o contrato e o mapa das listas. Pra várias notas seguidas, usar a mesma sessão. Mais em [[Guia-de-Tokens]].
