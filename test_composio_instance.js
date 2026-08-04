const { Composio } = require('@composio/core');

try {
    const composio = new Composio();
    console.log("Composio instance keys:", Object.keys(composio));
    console.log("Prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(composio)));
    if (composio.tools) console.log("composio.tools keys:", Object.keys(composio.tools), Object.getOwnPropertyNames(Object.getPrototypeOf(composio.tools)));
    if (composio.connectedAccounts) console.log("composio.connectedAccounts keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(composio.connectedAccounts)));
} catch (e) {
    console.error("Error creating Composio instance:", e.message);
}
