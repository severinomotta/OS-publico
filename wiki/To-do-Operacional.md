Pendências técnicas de projetos e sistemas — trabalho que o Claude registra e acompanha por conta própria (partes intermediárias de construção, calibrações, testes que faltam). **Não é a lista de tarefas do usuário**: quando ele pergunta "o que tenho pra fazer", esta lista não entra na resposta, a não ser que peça. As tarefas dele vivem em [[To-do]]. Mesmas regras de saída: item só sai com confirmação do usuário ou evidência inequívoca de conclusão, e migra pra [[Concluídos]] — nunca é apagado. Se um item daqui precisar de uma ação do usuário (uma decisão, um material que só ele tem), essa ação é destacada quando o projeto estiver em pauta — não vaza pra lista pessoal.

**Formato dos itens: ponteiro fino.** Estado atual, próximo passo, o que bloqueia, link pra página do projeto — a história e a especificação moram na página, nunca aqui. Item cujo texto muda ganha carimbo `Atualizado: DD/MM`. **Atualizar é reescrever o item, nunca anexar parágrafo** — teto de ~700 bytes por item e ~20 KB pela lista, fiscalizado pelo hook `SessionStart` ([[Lint-da-Wiki]]). Itens agrupados por projeto (###) só pra navegação — a lista continua uma só.

## Pendente

