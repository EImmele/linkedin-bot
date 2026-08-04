const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

// Person URN: urn:li:person:5hsZV3R7wy (Virginia Azevedo)
// Parent Comment URN: urn:li:comment:(urn:li:activity:7490327458907582464,7490352499766267904)
// Activity URN: urn:li:activity:7490327458907582464

async function testTaggedReply() {
    try {
        console.log("Testing tagged reply with MemberAttributedEntity...");

        const parentCommentUrn = "urn:li:comment:(urn:li:activity:7490327458907582464,7490352499766267904)";
        const personUrn = "urn:li:person:5hsZV3R7wy";
        const personName = "Virginia Azevedo";
        
        const messageText = `${personName} Exatamente essa virada de chave! Na governança de CISM e Risk IT, quando conectamos o risco ao impacto financeiro, a liderança assume a decisão com clareza.`;

        const payload = {
            actor: "urn:li:person:58-ptj8JVY",
            message: {
                text: messageText,
                attributes: [
                    {
                        start: 0,
                        length: personName.length,
                        value: {
                            "com.linkedin.common.MemberAttributedEntity": {
                                member: personUrn
                            }
                        }
                    }
                ]
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
        console.error("Error posting tagged reply:", e);
    }
}

testTaggedReply();
