const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

async function getAccount() {
    try {
        const acc = await composio.connectedAccounts.get("ca_JGuOK7B9opjF");
        console.log("Account details:", JSON.stringify(acc, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

getAccount();
