const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');

const outputDir = "D:\\IA projects\\Linkedin Bot";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function createProjectDocumentationDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "DOCUMENTAÇÃO TÉCNICA & OPERACIONAL DO PROJETO",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    text: "Executive Authority Engine & Automação LinkedIn / Telegram 24/7",
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "Última Atualização: Agosto de 2026 (v3.0)", alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "1. VISÃO GERAL DA SOLUÇÃO", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    children: [
                        new TextRun("O "),
                        new TextRun({ text: "Executive Authority Engine", bold: true }),
                        new TextRun(" é um sistema autônomo de publicação de conteúdo técnico no LinkedIn e gestão de engajamento mobile via Telegram. Ele permite que executivos e especialistas de qualquer segmento (CISO, GRC, Direito, Medicina, Finanças, etc.) mantenham presença constante e de alta autoridade profissional no LinkedIn sem perder tempo digitando ou abrindo a plataforma.")
                    ]
                }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "2. ARQUITETURA TÉCNICA E SERVIÇOS INTEGRADOS", heading: HeadingLevel.HEADING_2 }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "COMPONENTE", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "SERVIÇO / PLATAFORMA", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "FUNÇÃO NO SISTEMA", bold: true })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "API do LinkedIn", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "LinkedIn API v2 (RestLi 2.0)" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Disparo de posts em Perfis Pessoais e Páginas de Empresa, busca de comentários, réplicas aninhadas e marcação em azul (@Mention)." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Gestão OAuth", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Composio Proxy API" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Gerenciamento seguro de autenticação sem expirar e sem compartilhar senhas (Connected Account ID: ca_JGuOK7B9opjF)." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Painel Celular", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Telegram Bot API (@Erik_L_Bot)" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Interface mobile em 1 clique para aprovar posts, visualizar rascunhos, monitorar comentários a cada 3 min, usar /addpost e alternar entre Modo Manual e Piloto Automático." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Motor de Respostas Naturais", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "generateSmartResponse Engine" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Classificador inteligente por extensão e intenção. Trata elogios curtos e emojis com respostas humanas e calorosas, eliminando jargões robóticos e preservando a Regra de Ouro #1." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Servidor Nuvem 24/7", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Render.com (Web Service Free)" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Hospedagem 24/7 com Keep-Alive Ping automático a cada 10 min, garantindo operação contínua sem entrar em hibernação." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Agendador & Timezone", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "node-cron (America/Sao_Paulo)" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Agendamento travado no fuso oficial de Brasília para disparos pontuais às 09:45 AM em Terças, Quartas e Quintas, e poller de comentários a cada 3 min." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Persistência Multi-Arquivo", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "chat_config.json, tracked_posts.json, responded_comments.json" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Gravador de estado em disco: Chat ID, posts monitorados dinamicamente e trava anti-duplicação de comentários." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Repositório Código", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "GitHub (EImmele/linkedin-bot)" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Versionamento de código-fonte e sincronização automática de deploys na nuvem via Git." })] }),
                            ]
                        })
                    ]
                }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "3. MECANISMOS DE RESILIÊNCIA & OPERAÇÃO 24/7", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Keep-Alive Self Ping: ", bold: true }),
                        new TextRun("O bot executa requisições HTTP internas para https://linkedin-bot-4b2m.onrender.com a cada 10 minutos. Isso evita que o plano gratuito do Render desative o container por inatividade.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Trava de Fuso Horário BRT: ", bold: true }),
                        new TextRun("O agendador utiliza a configuração explicitada 'America/Sao_Paulo', impedindo desalinhamento com o relógio UTC do servidor cloud.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Monitoramento a cada 3 Minutos: ", bold: true }),
                        new TextRun("O robô realiza polling automático na API do LinkedIn a cada 3 minutos procurando novos comentários em todos os posts cadastrados em tracked_posts.json.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Comando /addpost e Leitor de Links: ", bold: true }),
                        new TextRun("Cole qualquer link de post do LinkedIn no Telegram para adicioná-lo instantaneamente ao monitoramento permanente de comentários 24/7.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Persistência em Disco: ", bold: true }),
                        new TextRun("Os arquivos chat_config.json, tracked_posts.json e responded_comments.json garantem que reinícios do servidor nuvem não percam dados.\n")
                    ]
                }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "4. REGRAS DE PERSONA & GOVERNANÇA (MASTER PROMPT)", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Regra de Ouro #1 da Persona: ", bold: true }),
                        new TextRun("A IA fala 100% na 1ª pessoa do singular no tom do especialista. É estritamente proibido parecer um robô ou responder elogios simples com discursos robóticos descontextualizados.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Regra de Ouro #2 - Human-in-the-loop: ", bold: true }),
                        new TextRun("No modo Manual, nenhuma publicação ou resposta vai ao ar sem a revisão prévia e o clique de aprovação no Telegram.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Resposta com @Mention em Azul: ", bold: true }),
                        new TextRun("Toda resposta a comentário utiliza o atributo MemberAttributedEntity para notificar o comentarista no LinkedIn com link azul clicável.\n")
                    ]
                }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "5. ESTRUTURA DE PASTAS E ARQUIVOS", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "D:\\IA projects\\Linkedin Bot\\\n" +
                               "├── telegram_bot_server.js            (Servidor principal com Cron, Monitor, Health Server e Bot)\n" +
                               "├── chat_config.json                  (Configurações persistentes de Chat ID e Modo de Aprovação)\n" +
                               "├── tracked_posts.json                (Lista dinâmica de URNs de posts monitorados 24/7)\n" +
                               "├── responded_comments.json           (Registro de IDs de comentários processados para deduplicação)\n" +
                               "├── package.json                      (Dependências do projeto Node.js)\n" +
                               "└── README.md                         (Documentação técnica formatada em Markdown)\n" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "6. MANUTENÇÃO & TROUBLESHOOTING", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Atualizar Código na Nuvem: Faça as alterações locais na pasta do projeto e execute 'git push origin main'. O Render atualizará o bot automaticamente em segundos.\n" }),
                new Paragraph({ text: "• Re-autenticar LinkedIn: Se o acesso cair por revogação de permissão no LinkedIn, acesse a Composio e reconecte a conta OAuth em 1 clique.\n" }),
                new Paragraph({ text: "• Ativação do Telegram: Caso deseje reconfigurar o bot em outro celular, basta enviar a mensagem '/start' ou colar um link de post no Telegram para associar o novo Chat ID." })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    let targetPath = path.join(outputDir, "Documentacao_Tecnica_e_Operacional_do_Projeto_v3.docx");
    try {
        fs.writeFileSync(targetPath, buffer);
        console.log(`✅ Documentação Técnica Word gerada em: ${targetPath}`);
    } catch (err) {
        console.error("Erro ao gerar docx:", err.message);
    }
}

async function createReadmeMarkdown() {
    const readmeContent = `# Executive Authority Engine & Automação LinkedIn / Telegram 24/7

Sistema autônomo de gestão de autoridade no LinkedIn com painel mobile via Telegram, integração com a API v2 do LinkedIn (via Composio Proxy), hospedagem 24/7 no Render.com e Motor Inteligente de Respostas Naturais.

---

## 🌟 Funcionalidades Principais

- **Publicação Automatizada & Manual:** Posts no perfil pessoal e páginas de empresas.
- **Painel Mobile Telegram (@Erik_L_Bot):** Alternância entre *Piloto Automático* e *Aprovação Manual (Human-in-the-Loop)* em 1 clique.
- **Motor de Respostas Naturais (\`generateSmartResponse\`):**
  - Classificação inteligente por intenção e extensão.
  - Elogios curtos e emojis (*"Excelente 👏 👏 👏"*, *"Boa, Erik 👏"*) recebem respostas calorosas e autênticas em tom humano, prevenindo tom robótico e preservando a **Regra de Ouro #1**.
  - Perguntas técnicas recebem embasamento prático em GRC / Risk IT / CISM e pergunta provocativa de debate.
- **Monitoramento Automático a Cada 3 Minutos:** Poller contínuo que varre posts ativos e notifica proativamente o Telegram sobre novos comentários.
- **Comando \`/addpost <link>\` & Detetor de Links:** Adição dinâmica de qualquer post do LinkedIn para monitoramento 24/7.
- **Mecanismo Resiliente 24/7:**
  - **Self-Ping Keep-Alive:** Pings automáticos a cada 10 minutos para impedir o modo de hibernação (*sleep*) do plano gratuito do Render.
  - **Timezone Fixo (\`America/Sao_Paulo\`):** Disparos pontuais às **09:45 AM (Horário de Brasília)** nas terças, quartas e quintas.
  - **Persistência Multi-Arquivo (\`chat_config.json\`, \`tracked_posts.json\`, \`responded_comments.json\`):** Salvamento automático do estado no disco.
- **Engajamento com @Mention em Azul:** Respostas a comentários no LinkedIn com marcação de membro via atributo \`MemberAttributedEntity\`.

---

## 🛠️ Arquitetura Técnica

| Componente | Tecnologia / Serviço | Função |
| :--- | :--- | :--- |
| **API do LinkedIn** | LinkedIn API v2 (RestLi 2.0) | Disparo de posts, leitura de comentários, réplicas e marcações (@). |
| **Gestão OAuth** | Composio Proxy API | Autenticação persistente sem expirar senhas (\`ca_JGuOK7B9opjF\`). |
| **Interface Mobile** | Telegram Bot API (\`@Erik_L_Bot\`) | Aprovação em 1 clique, adição de posts (\`/addpost\`) e notificações proativas. |
| **Motor de Respostas** | \`generateSmartResponse\` Engine | Classificação por contexto e geração de respostas 100% autênticas e humanas. |
| **Hospedagem Nuvem** | Render.com (Web Service Free) | Servidor 24/7 com Keep-Alive Ping automático. |
| **Agendador 24/7** | \`node-cron\` (\`America/Sao_Paulo\`) | Disparo no Horário Nobre (09:45 BRT) e monitoramento a cada 3 min. |
| **Persistência** | JSON Storage (\`chat_config.json\`, \`tracked_posts.json\`, \`responded_comments.json\`) | Preservação de dados e trava anti-duplicação de respostas. |

---

## 🚀 Como Funciona o Fluxo de Trabalho

### 1. Disparo de Publicações (Horário Nobre - 09:45 AM BRT)
- No **Modo Piloto Automático**, o post agendado é publicado diretamente no LinkedIn às 09:45 AM BRT.
- No **Modo Aprovação Manual**, o Telegram recebe um alerta interativo com botões para publicar em 1 clique.

### 2. Monitoramento de Comentários & Respostas com @Mention
- A cada 3 minutos, o servidor consulta o LinkedIn em busca de comentários em todos os posts rastreados.
- O motor de respostas analisa o comentário e gera uma sugestão autêntica e personalizada.
- A resposta é enviada ao LinkedIn com marcação em azul (\`@Mention\`).

---

## 📁 Estrutura do Repositório

\`\`\`text
├── telegram_bot_server.js            # Servidor principal (Bot, Cron, Monitor & Health Check)
├── chat_config.json                  # Persistência de Chat ID e Modo de Aprovação
├── tracked_posts.json                # Lista de URNs de posts monitorados 24/7
├── responded_comments.json           # Trava anti-duplicação de respostas salvas em disco
├── package.json                      # Dependências Node.js
└── README.md                         # Documentação técnica em Markdown
\`\`\`

---

## ⚙️ Manutenção & Comandos Úteis

- **Adicionar Post ao Monitoramento:** Envie \`/addpost <link_ou_id>\` para o bot no Telegram.
- **Alternar Modo de Aprovação:** Clique no botão no menu principal do Telegram.
- **Atualização na Nuvem:** Execute \`git push origin main\` no seu terminal para atualizar o Render.
`;

    const readmePath = path.join(__dirname, 'README.md');
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log(`✅ README.md gerado em: ${readmePath}`);
}

async function run() {
    await createProjectDocumentationDoc();
    await createReadmeMarkdown();
}

run();
