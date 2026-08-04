const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

// Virginia Azevedo comment ID: 7490352499766267904
// Post URN: urn:li:share:7490327458173399040 (activity: 7490327458907582464)

async function testNestedReply() {
    try {
        console.log("Testing nested reply under Virginia's comment...");

        const parentCommentUrn = "urn:li:comment:(urn:li:activity:7490327458907582464,7490352499766267904)";

        const payload = {
            actor: "urn:li:person:58-ptj8JVY",
            message: {
                text: "Virginia Azevedo Exatamente essa virada de chave! Na governança de CISM e Risk IT, quando conectamos o risco ao impacto financeiro, a liderança assume a decisão com clareza."
            },
            object: "urn:li:activity:7490327458907582464",
            parentComment: parentCommentUrn
        };

        const response = await composio.tools.proxyExecute({
            endpoint: "https://api.linkedin.com/v2/socialActions/urn%3Ali%3Aactivity%3A7490327458907582464/comments",
            method: "POST",
            connectedAccountId: "ca_JGuOK7B9opjF",
            headers: {
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json"
            },
            body: payload
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("Error posting nested reply:", e);
    }
}

testNestedReply();
