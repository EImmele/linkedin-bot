# Executive Authority Engine & Automação LinkedIn / Telegram 24/7

Sistema autônomo de gestão de autoridade no LinkedIn com painel mobile via Telegram, integração com a API v2 do LinkedIn (via Composio Proxy), hospedagem 24/7 no Render.com e Motor Inteligente de Respostas Naturais.

---

## 🌟 Funcionalidades Principais

- **Publicação Automatizada & Manual:** Posts no perfil pessoal e páginas de empresas.
- **Painel Mobile Telegram (@Erik_L_Bot):** Alternância entre *Piloto Automático* e *Aprovação Manual (Human-in-the-Loop)* em 1 clique.
- **Motor de Respostas Naturais (`generateSmartResponse`):**
  - Classificação inteligente por intenção e extensão.
  - Elogios curtos e emojis (*"Excelente 👏 👏 👏"*, *"Boa, Erik 👏"*) recebem respostas calorosas e autênticas em tom humano, prevenindo tom robótico e preservando a **Regra de Ouro #1**.
  - Perguntas técnicas recebem embasamento prático em GRC / Risk IT / CISM e pergunta provocativa de debate.
- **Monitoramento Automático a Cada 3 Minutos:** Poller contínuo que varre posts ativos e notifica proativamente o Telegram sobre novos comentários.
- **Comando `/addpost <link>` & Detetor de Links:** Adição dinâmica de qualquer post do LinkedIn para monitoramento 24/7.
- **Mecanismo Resiliente 24/7:**
  - **Self-Ping Keep-Alive:** Pings automáticos a cada 10 minutos para impedir o modo de hibernação (*sleep*) do plano gratuito do Render.
  - **Timezone Fixo (`America/Sao_Paulo`):** Disparos pontuais às **09:45 AM (Horário de Brasília)** nas terças, quartas e quintas.
  - **Persistência Multi-Arquivo (`chat_config.json`, `tracked_posts.json`, `responded_comments.json`):** Salvamento automático do estado no disco.
- **Engajamento com @Mention em Azul:** Respostas a comentários no LinkedIn com marcação de membro via atributo `MemberAttributedEntity`.

---

## 🛠️ Arquitetura Técnica

| Componente | Tecnologia / Serviço | Função |
| :--- | :--- | :--- |
| **API do LinkedIn** | LinkedIn API v2 (RestLi 2.0) | Disparo de posts, leitura de comentários, réplicas e marcações (@). |
| **Gestão OAuth** | Composio Proxy API | Autenticação persistente sem expirar senhas (`ca_JGuOK7B9opjF`). |
| **Interface Mobile** | Telegram Bot API (`@Erik_L_Bot`) | Aprovação em 1 clique, adição de posts (`/addpost`) e notificações proativas. |
| **Motor de Respostas** | `generateSmartResponse` Engine | Classificação por contexto e geração de respostas 100% autênticas e humanas. |
| **Hospedagem Nuvem** | Render.com (Web Service Free) | Servidor 24/7 com Keep-Alive Ping automático. |
| **Agendador 24/7** | `node-cron` (`America/Sao_Paulo`) | Disparo no Horário Nobre (09:45 BRT) e monitoramento a cada 3 min. |
| **Persistência** | JSON Storage (`chat_config.json`, `tracked_posts.json`, `responded_comments.json`) | Preservação de dados e trava anti-duplicação de respostas. |

---

## 🚀 Como Funciona o Fluxo de Trabalho

### 1. Disparo de Publicações (Horário Nobre - 09:45 AM BRT)
- No **Modo Piloto Automático**, o post agendado é publicado diretamente no LinkedIn às 09:45 AM BRT.
- No **Modo Aprovação Manual**, o Telegram recebe um alerta interativo com botões para publicar em 1 clique.

### 2. Monitoramento de Comentários & Respostas com @Mention
- A cada 3 minutos, o servidor consulta o LinkedIn em busca de comentários em todos os posts rastreados.
- O motor de respostas analisa o comentário e gera uma sugestão autêntica e personalizada.
- A resposta é enviada ao LinkedIn com marcação em azul (`@Mention`).

---

## 📁 Estrutura do Repositório

```text
├── telegram_bot_server.js            # Servidor principal (Bot, Cron, Monitor & Health Check)
├── chat_config.json                  # Persistência de Chat ID e Modo de Aprovação
├── tracked_posts.json                # Lista de URNs de posts monitorados 24/7
├── responded_comments.json           # Trava anti-duplicação de respostas salvas em disco
├── package.json                      # Dependências Node.js
└── README.md                         # Documentação técnica em Markdown
```

---

## ⚙️ Manutenção & Comandos Úteis

- **Adicionar Post ao Monitoramento:** Envie `/addpost <link_ou_id>` para o bot no Telegram.
- **Alternar Modo de Aprovação:** Clique no botão no menu principal do Telegram.
- **Atualização na Nuvem:** Execute `git push origin main` no seu terminal para atualizar o Render.
