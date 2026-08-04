const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

async function getTools() {
    try {
        const tools = await composio.tools.getRawComposioTools({ toolkits: ["linkedin"] });
        console.log("LinkedIn Tool Slugs:", tools.map(t => t.slug));
    } catch (e) {
        console.error("Error:", e);
    }
}

getTools();
