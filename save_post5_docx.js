const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const outputDir = "D:\\IA projects";

const postContent = `Quando ocorre um vazamento crítico de dados, a sua equipe tem um plano de resposta testado ou o caos toma conta das primeiras 2 horas?

Em uma crise cibernética real, a falta de um plano de gestão de incidentes estruturado faz com que o tempo precioso de contenção seja perdido em reuniões de alinhamento e decisões improvisadas.

Segundo o CISM (Certified Information Security Manager) da ISACA e o COBIT 2019 (DSS02/DSS03), o objetivo principal da Gestão de Incidentes não é apenas apagar o fogo, mas conter a ameaça com velocidade para proteger os ativos críticos do negócio.

A ISACA orienta cinco fases fundamentais para a Maturidade na Resposta a Incidentes:

1. Detecção & Triagem (Detection & Triage)
Identificar e classificar a gravidade do evento em minutos a partir de alertas de SIEM e monitoramento preditivo, eliminando falsos positivos.

2. Contenção Imediata (Containment)
Isolar os sistemas afetados e bloquear os vetores de ataque para evitar a propagação lateral e o vazamento massivo de dados.

3. Erradicação da Causa Raiz (Eradication)
Remover o artefato malicioso do ambiente e corrigir a vulnerabilidade explorada antes de restabelecer os acessos.

4. Recuperação Orientada a RTO/RPO (Recovery)
Restaurar as operações críticas dentro dos prazos operacionais aceitáveis negociados com o negócio.

5. Lições Aprendidas & Revisão de GRC (Post-Mortem)
Elaborar o After Action Report para atualizar as políticas de segurança, fechar brechas de governança e treinar as equipes.

Gestão de incidentes eficiente não é sobre nunca sofrer um ataque, mas sobre responder com tanta precisão e velocidade que o negócio continue operando.`;

async function main() {
    const paragraphs = [
        new Paragraph({
            text: "Post 05 - Gestão de Incidentes (CISM Domain 4 & ISACA)",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            children: [
                new TextRun({ text: `Canal / Status: `, bold: true }),
                new TextRun({ text: "Pronto para Publicação / Salvo em Word e Imagem", italic: true })
            ]
        }),
        new Paragraph({ text: "" })
    ];

    for (const line of postContent.split('\n')) {
        paragraphs.push(new Paragraph({
            children: [new TextRun({ text: line, size: 24 })]
        }));
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(outputDir, "Post_05_Gestao_de_Incidentes_CISM_ISACA.docx");
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved: ${filePath}`);
}

main();
