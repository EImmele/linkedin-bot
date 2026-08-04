const { Composio } = require('@composio/core');

const composio = new Composio({
    apiKey: "ak_3BPACosEfxI3fgs-0i_Q"
});

async function main() {
    try {
        console.log("Fetching connected accounts...");
        const connectedAccounts = await composio.connectedAccounts.list();
        console.log("Connected Accounts count:", connectedAccounts.items ? connectedAccounts.items.length : connectedAccounts);
        console.log(JSON.stringify(connectedAccounts, null, 2));
    } catch (e) {
        console.error("Error fetching connected accounts:", e);
    }
}

main();
