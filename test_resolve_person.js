const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

async function inspectComments() {
    try {
        console.log("Fetching raw comments for Post 1...");
        const response = await composio.tools.proxyExecute({
            endpoint: "https://api.linkedin.com/v2/socialActions/urn%3Ali%3Ashare%3A7490327458173399040/comments",
            method: "GET",
            connectedAccountId: "ca_JGuOK7B9opjF",
            headers: {
                "X-Restli-Protocol-Version": "2.0.0"
            }
        });

        console.log("Raw Comments Response:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("Error fetching comments:", e);
    }
}

inspectComments();
