const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');

const outputDir = "D:\\IA projects\\Linkedin Bot";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function createProposalDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "EXECUTIVE AUTHORITY ENGINE",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    text: "Serviço de Gestão de Autoridade no LinkedIn para Líderes de TI, GRC & C-Level",
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "1. RESUMO EXECUTIVO", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "No mercado atual de tecnologia, cibersegurança e governança (GRC), a autoridade de um executivo é seu maior ativo estratégico. O Executive Authority Engine combina inteligência especializada com automação mobile via Telegram, permitindo que você publique conteúdos técnicos de alto impacto e responda a executivos em menos de 5 segundos por semana — tudo sem compartilhar senhas e com total controle." })
                    ]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "2. PLANOS & INVESTIMENTO MENSAL", heading: HeadingLevel.HEADING_2 }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "PLANO", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "ENTREGÁVEIS MENSAL", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "INVESTIMENTO", bold: true })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Executive Leader", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "8 Posts Técnicos + 8 Infográficos PNG + Bot no Telegram + Respostas com @Mention" })] }),
                                new TableCell({ children: [new Paragraph({ text: "R$ 2.900,00 / mês" })] }),
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "C-Suite Enterprise", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "12 Posts Perfil + 12 Posts Empresa + Infográficos + Bot no Telegram + Respostas @Mention + Relatório" })] }),
                                new TableCell({ children: [new Paragraph({ text: "R$ 4.900,00 / mês" })] }),
                            ]
                        })
                    ]
                })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(outputDir, "Proposta_Comercial_Executive_Authority.docx"), buffer);
    console.log("✅ Proposta Comercial Word gerada em D:\\IA projects\\Linkedin Bot\\Proposta_Comercial_Executive_Authority.docx");
}

async function createScriptDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "SCRIPT DE VENDAS & ABORDAGEM - EXECUTIVE AUTHORITY ENGINE",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "1. SCRIPT DE ABORDAGEM DIRETA NO LINKEDIN", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "\"Olá [Nome], tudo bem? Acompanho sua trajetória como [Cargo] e vejo um potencial enorme na sua bagagem. Desenvolvemos uma tecnologia onde líderes gerenciam sua autoridade no LinkedIn em 5 segundos por semana, aprovando rascunhos técnicos e respostas direto pelo Telegram, sem precisar abrir a rede ou dar senhas. Posso te mandar um vídeo de 1 minuto mostrando como funciona?\"", italic: true })
                    ]
                })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(outputDir, "Script_Vendas_Executive_Authority.docx"), buffer);
    console.log("✅ Script de Vendas Word gerado em D:\\IA projects\\Linkedin Bot\\Script_Vendas_Executive_Authority.docx");
}

async function run() {
    await createProposalDoc();
    await createScriptDoc();
}

run();
