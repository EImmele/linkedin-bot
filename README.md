# Executive Authority Engine & Automação LinkedIn / Telegram 24/7

Sistema autônomo de gestão de autoridade no LinkedIn com painel mobile via Telegram, integração com a API v2 do LinkedIn (via Composio Proxy) e hospedagem 24/7 no Render.com.

---

## 🌟 Funcionalidades Principais

- **Publicação Automatizada & Manual:** Posts no perfil pessoal e páginas de empresas.
- **Painel Mobile Telegram (@Erik_L_Bot):** Alternância entre *Piloto Automático* e *Aprovação Manual (Human-in-the-Loop)* em 1 clique.
- **Mecanismo Resiliente 24/7:**
  - **Self-Ping Keep-Alive:** Pings automáticos a cada 10 minutos para impedir o modo de hibernação (*sleep*) do plano gratuito do Render.
  - **Timezone Fixo (`America/Sao_Paulo`):** Disparos pontuais às **09:45 AM (Horário de Brasília)** nas terças, quartas e quintas.
  - **Persistência de Dados (`chat_config.json`):** Salvamento automático do Chat ID do Telegram no disco para recuperação instantânea em restarts do servidor.
- **Engajamento com @Mention em Azul:** Respostas a comentários no LinkedIn com marcação de membro via atributo `MemberAttributedEntity`.
- **Analytics Nativo Integrado:** Consulta de impressões, engajamento e dados demográficos do público direto pelo Telegram.

---

## 🛠️ Arquitetura Técnica

| Componente | Tecnologia / Serviço | Função |
| :--- | :--- | :--- |
| **API LinkedIn** | LinkedIn REST API v2 | Publicação, comentários e métricas de social actions |
| **OAuth Manager** | Composio Proxy API | Gestão de tokens OAuth (`ca_JGuOK7B9opjF`) |
| **Interface Mobile** | Telegram Bot API | Painel de controle e alertas de aprovação |
| **Hospedagem** | Render.com (Web Service) | Servidor em nuvem 24h por dia |
| **Agendador** | `node-cron` | Agendamento na timezone `America/Sao_Paulo` |
| **Repositório** | GitHub (`EImmele/linkedin-bot`) | CI/CD automatizado via Git Push |

---

## 🚀 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/EImmele/linkedin-bot.git
   cd linkedin-bot
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   node telegram_bot_server.js
   ```

---

## 📄 Licença
Propriedade de Erik Immele - Executive Authority Engine.
