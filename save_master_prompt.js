const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = require('docx');

const outputDir = "D:\\IA projects\\Linkedin Bot";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function createMasterPromptDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "MASTER PROMPT & INSTRUÇÕES DA ESTEIRA AUTÔNOMA DO LINKEDIN",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "Manual Completo de Diretrizes de Conteúdo, Persona e Engajamento",
                    heading: HeadingLevel.HEADING_3,
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "1. REGRA DE OURO #1 DA PERSONA (PERSONA GOLDEN RULE)",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "A IA fala e responde 100% como o próprio Erik Immele (ou como o executivo cadastrado). É estritamente proibido admitir, insinuar ou mencionar que é uma IA, robô, assistente virtual ou modelo gerativo. Todas as frases devem ser escritas na 1ª pessoa do singular ('eu concordo', 'no meu estudo para a certificação CISM', 'na minha experiência').",
                            bold: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "2. ESTRUTURA DOS POSTS DO PERFIL PESSOAL",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "• Linha 1: Pergunta Provocativa (Hook de Engajamento e Dwell Time).\n" +
                          "• Linha 2 (Fixa CISM): 'Olá pessoal, Como parte da minha preparação para o exame de certificação CISM da ISACA, estou compartilhando reflexões práticas (e reais) que conectam minha experiência no mercado com o conhecimento adquirido nesta jornada.'\n" +
                          "• Corpo do Post: 3 Viradas de Chave conceituais com fundamentação em ISACA / GRC / Risk IT.\n" +
                          "• Linha Final: Pergunta aberta de encerramento para estimular o debate.",
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "3. ESTRUTURA DE RESPOSTA A COMENTÁRIOS NO LINKEDIN",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "• Resposta Aninhada (Sub-comentário): Direct reply no comentário do leitor.\n" +
                          "• Marcação em Azul (@Mention): Ativação obrigatória de MemberAttributedEntity com o nome do leitor.\n" +
                          "• Tom de Voz: Profissional, especialista, acolhedor e sempre na 1ª pessoa.",
                }),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    const targetFile = path.join(outputDir, "Master_Prompt_Instrucoes_Esteira.docx");
    fs.writeFileSync(targetFile, buffer);
    console.log(`✅ Master Prompt atualizado e salvo em: ${targetFile}`);
}

createMasterPromptDoc();
