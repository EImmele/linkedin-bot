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

                new Paragraph({ text: "2. ARQUITETURA TÉCNICA E SERVIÇOS INTEGRADOSS", heading: HeadingLevel.HEADING_2 }),
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
                                new TableCell({ children: [new Paragraph({ text: "Interface mobile em 1 clique para aprovar posts, visualizar rascunhos, revisar os últimos 5 comentários e excluir posts do ar." })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Servidor Nuvem 24/7", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Render.com (Web Service Free)" })] }),
                                new TableCell({ children: [new Paragraph({ text: "Hospedagem gratuita permanente 24h por dia, 365 dias por ano. Mantém o bot online mesmo com o computador do usuário desligado." })] }),
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

                new Paragraph({ text: "3. REGRAS DE PERSONA & GOVERNANÇA (MASTER PROMPT)", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Regra de Ouro #1 da Persona: ", bold: true }),
                        new TextRun("A IA fala 100% na 1ª pessoa do singular no tom do especialista. É estritamente proibido mencionar ou insinuar que o conteúdo ou resposta é gerado por IA/robô.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Estrutura de Dwell Time: ", bold: true }),
                        new TextRun("1ª linha com pergunta provocativa (Hook) ➡️ Mensagem fixa da jornada (CISM) ➡️ 3 Viradas de Chave conceituais ➡️ Pergunta aberta de fechamento.\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Resposta com @Mention em Azul: ", bold: true }),
                        new TextRun("Toda resposta a comentário utiliza o atributo MemberAttributedEntity para notificar o comentarista no LinkedIn com link azul clicável.\n")
                    ]
                }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "4. ESTRUTURA DE PASTAS E ARQUIVOS", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "D:\\IA projects\\Linkedin Bot\\\n" +
                               "├── Posts\\                             (Posts em .docx e Infográficos .png)\n" +
                               "├── Comercial\\                         (Proposta Comercial, Script de Vendas e Formulário Mestre Universal)\n" +
                               "└── Master_Prompt_Instrucoes_Esteira.docx (Manual com as regras de persona e engajamento)\n" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "5. MANUTENÇÃO & TROUBLESHOOTING", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Atualizar Código na Nuvem: Faça as alterações locais na pasta scratch e execute git push origin main. O Render atualizará o bot em 30 segundos automaticamente.\n" }),
                new Paragraph({ text: "• Re-autenticar LinkedIn: Se o acesso cair por revogação de permissão no LinkedIn, acesse a Composio e reconecte a conta OAuth em 1 clique." })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(outputDir, "Documentacao_Tecnica_e_Operacional_do_Projeto.docx"), buffer);
    console.log("✅ Documentação Técnica Word gerada em D:\\IA projects\\Linkedin Bot\\Documentacao_Tecnica_e_Operacional_do_Projeto.docx");
}

createProjectDocumentationDoc();
