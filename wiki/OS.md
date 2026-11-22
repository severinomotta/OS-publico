Página central do sistema: um vault de arquivos de texto operado pelo Claude Code, versionado num repositório privado do GitHub. Quem é o usuário: [[Perfil]]. Por que é assim: `docs/arquitetura.md`.

## Estado atual

⟪preencher na instalação: nome do sistema, data de nascimento, repositório, se o robô Google e a captura pelo celular estão ligados⟫

## Mapa

- Quem é o usuário: [[Perfil]]
- Tarefas: [[To-do]] · pendências técnicas: [[To-do-Operacional]] · feito: [[Concluídos]]
- Discussões paradas: [[Checkpoints]]
- Manutenção: [[Manutencao-do-Contrato]] · [[Lint-da-Wiki]] · [[Grafo-do-Vault]]
- Ferramentas: [[Guia-de-Tokens]] · [[Robo-Google]] · [[Protocolo-Chrome]] · [[Padrao-Emails]] · [[Convencoes-Apps-Script]] · [[Avaliacoes-Tooling-IA]]
- Celular: [[Captura-pelo-Celular]]
- Arquivos guardados: [[Documentos]]

Áreas e projetos do usuário entram neste mapa quando nascerem (nenhuma página nasce vazia).

## Como as peças se encaixam

1. **Captura**: o usuário fala ou digita qualquer coisa no Claude Code, sem organizar. O Claude reconhece o que aquilo é e leva pra casa certa (lista, página existente, página nova).
2. **Wiki**: `wiki/` guarda o conhecimento consolidado. Página é estado ("como está agora"), não diário.
3. **Contrato**: o `CLAUDE.md` é lido em toda mensagem e diz como o Claude se comporta.
4. **Hooks**: scripts que rodam sozinhos. Ao abrir sessão: sincronizam com o GitHub e mostram o mapa das listas. A cada mensagem: medem o contexto e lembram o selo.
5. **Git/GitHub**: todo registro vira commit. Nada se perde, tudo se desfaz.
6. **Selo**: toda resposta termina com `✅ Clear liberado` (pode dar `/clear` sem perder nada) ou `⏸ Discussão aberta` (ainda tem coisa só na conversa).
