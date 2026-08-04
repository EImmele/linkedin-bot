const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });
console.log("Tools methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(composio.tools)));
