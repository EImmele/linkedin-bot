async function getBotInfo() {
    try {
        const res = await fetch("https://api.telegram.org/bot8950102443:AAFB8f9PUkaBAh9MLUYLY2f5z6I7GloAA8Y/getMe");
        const data = await res.json();
        console.log("Bot Info:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
getBotInfo();
