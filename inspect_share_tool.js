const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

async function inspectTool() {
    try {
        const tool = await composio.tools.getRawComposioToolBySlug("LINKEDIN_CREATE_ARTICLE_OR_URL_SHARE");
        console.log("Tool Schema:", JSON.stringify(tool, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

inspectTool();
