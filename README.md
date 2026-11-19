# TechSolutions — Sistema de Gerenciamento de Tarefas

> *"Do backlog ao deploy, sem perder o fio."*

Sistema leve, moderno e intuitivo desenvolvido sob medida para a equipe de desenvolvimento da **TechSolutions Tecnologia S.A.** (Florianópolis - SC), baseado nas diretrizes do **Estudo de Caso 2**.

---

## 🎨 Identidade Visual e Cores Oficiais Aplicadas

A interface segue rigorosamente a paleta de cores e psicologia de design descritas no documento de estudo de caso:

| Cor | Código HEX | Aplicação na Interface | Função & Psicologia |
| :--- | :---: | :--- | :--- |
| **Azul Elétrico** | `#2563EB` | Cor primária, botões principais, links e backlog | Foco, lógica e confiança |
| **Roxo Inovação** | `#7C3AED` | Indicadores de *"Novo Recurso"*, em andamento | Criatividade e visão de futuro |
| **Âmbar Prazo** | `#F59E0B` | Alerta suave para tarefas que vencem hoje/amanhã | Alerta sem pânico visual |
| **Verde Concluído** | `#10B981` | Status *"Concluída"* e progresso do Sprint | Realização e sensação de dever cumprido |
| **Grafite Dev** | `#1E293B` | Tipografia principal e modo escuro | Sobriedade e concentração |
| **Cinza Névoa** | `#F1F5F9` | Fundo das colunas do quadro e superfícies | Neutralidade e contraste para os cartões |

### Tipografia
- **Títulos e textos**: `Inter` (SemiBold / Regular)
- **Códigos e identificadores** (ex: `TS-101`): `JetBrains Mono`

---

## 🚀 Funcionalidades Principais (CRUD Completo)

1. **Criar (Create)**:
   - Botão **"+ Nova Tarefa"** com formulário ágil e limpo.
   - Geração automática de identificadores de engenharia (`TS-101`, `TS-102`...).
   - **Responsável livre**: Permite digitar qualquer nome de pessoa/colaborador livremente, com suporte a autocompletar dinâmico (`datalist`).
   - Definição de Tipo de Item, Data de Vencimento e Critérios de Aceite.

2. **Ler (Read)**:
   - **Quadro Kanban**: Colunas de *Backlog*, *Em Andamento* e *Concluído* com contadores em tempo real.
   - **Modo Lista**: Tabela compacta e limpa, ideal para foco no dia a dia.
   - **Filtros e Busca Instantânea**: Busca por código, título ou descrição; **filtro de responsáveis gerado dinamicamente** com base nos nomes digitados nas tarefas.
   - **Métricas do Sprint**: Total de itens, em andamento, alertas de prazo e taxa de conclusão do sprint.

3. **Atualizar (Update)**:
   - **Arrastar e Soltar (Drag & Drop)** nativo entre as colunas do Kanban.
   - **1-Clique para Concluir**: Botão de check rápido nos cartões ou tabela.
   - **Edição Completa**: Alteração de prazos, descrições e nomes de responsáveis.
   - **Comentários da Equipe**: Permite escrever livremente o nome do autor do comentário para esclarecimentos e alinhamentos técnicos.

4. **Excluir (Delete)**:
   - Exclusão individual de tarefas.
   - Ação **"Limpar Concluídas"** para manter a lista limpa e sem acúmulo de tarefas antigas (conforme requisito do briefing).

5. **Diferenciais Adicionais**:
   - **Modo Escuro / Claro**: Alternador na barra superior com persistência das preferências.
   - **Persistência Local**: Todos os dados são salvos no `localStorage` do navegador.
   - **Feedback descontraído**: Toasts amigáveis alinhados ao tom de voz do estudo (*"Tarefa movida para Concluído!"*).

---

## 📂 Como Executar

Basta abrir o arquivo [index.html](file:///C:/Users/Júlia%20Egito/Projetos/GerenciamentoListas/index.html) em qualquer navegador web moderno (Google Chrome, Microsoft Edge, Firefox, Brave, Safari).
