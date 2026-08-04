const { Composio } = require('@composio/core');

const API_KEY = "ak_3BPACosEfxI3fgs-0i_Q";
const CONNECTED_ACCOUNT_ID = "ca_JGuOK7B9opjF";

const TARGET_ORG_URN = "urn:li:organization:122274764";
const TARGET_PERSONAL_URN = "urn:li:person:58-ptj8JVY";

const composio = new Composio({ apiKey: API_KEY });

/**
 * Publishes a text post to LinkedIn (Company Page or Personal Profile).
 * @param {string} text 
 * @param {"company" | "personal"} target 
 */
async function publishToLinkedIn(text, target = "company") {
    if (!text || !text.trim()) {
        throw new Error("Post text cannot be empty.");
    }

    const authorUrn = target === "personal" ? TARGET_PERSONAL_URN : TARGET_ORG_URN;
    const targetName = target === "personal" ? "Perfil Pessoal (Erik Immele)" : "Página da Empresa (Audit Chain)";

    console.log(`🚀 Publishing post to LinkedIn -> ${targetName}...`);

    const payload = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": text
                },
                "shareMediaCategory": "NONE"
            }
        },
        visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    };

    const response = await composio.tools.proxyExecute({
        endpoint: "https://api.linkedin.com/v2/ugcPosts",
        method: "POST",
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        headers: {
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        },
        body: payload
    });

    if (response.status === 201 || (response.data && response.data.id)) {
        console.log(`✅ Post published successfully to ${targetName}!`);
        console.log("Post URN:", response.data.id);
        return response.data;
    } else {
        console.error("❌ Publication Failed:", response);
        throw new Error(`LinkedIn API returned status ${response.status}`);
    }
}

// Command-line execution: node publish_linkedin.js "Post text" "personal" OR "company"
if (require.main === module) {
    const textArg = process.argv[2];
    const targetArg = process.argv[3] || "company";
    if (textArg) {
        publishToLinkedIn(textArg, targetArg)
            .then(res => console.log("Done!", res))
            .catch(err => console.error("Error:", err));
    } else {
        console.log("Usage: node publish_linkedin.js <post_text> [company|personal]");
    }
}

module.exports = { publishToLinkedIn };
