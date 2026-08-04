const { Composio } = require('@composio/core');

const composio = new Composio({
    apiKey: "ak_3BPACosEfxI3fgs-0i_Q"
});

async function listTools() {
    try {
        console.log("Listing LinkedIn tools...");
        const tools = await composio.tools.getRawComposioToolsByToolkit("linkedin");
        console.log("Tools found:", tools.map(t => t.slug));
    } catch (e) {
        console.error("Error listing tools:", e);
    }
}

listTools();
