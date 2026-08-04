const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

async function getPersonalUrn() {
    try {
        console.log("Fetching personal user info from LinkedIn API via Composio Proxy...");
        const response = await composio.tools.proxyExecute({
            endpoint: "https://api.linkedin.com/v2/userinfo",
            method: "GET",
            connectedAccountId: "ca_JGuOK7B9opjF"
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

        if (response.data && response.data.sub) {
            console.log("\n✅ YOUR PERSONAL PERSON URN IS:", `urn:li:person:${response.data.sub}`);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

getPersonalUrn();
