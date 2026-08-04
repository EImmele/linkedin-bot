const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

async function resolvePerson() {
    try {
        console.log("Resolving person name for 5hsZV3R7wy...");
        const response = await composio.tools.proxyExecute({
            endpoint: "https://api.linkedin.com/v2/people/(id:5hsZV3R7wy)",
            method: "GET",
            connectedAccountId: "ca_JGuOK7B9opjF",
            headers: {
                "X-Restli-Protocol-Version": "2.0.0"
            }
        });

        console.log("Person Data:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("Error resolving person:", e);
    }
}

resolvePerson();
