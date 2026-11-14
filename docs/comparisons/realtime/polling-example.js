// HTTP Polling Client-Side: Sürekli sunucuya sorma mekanizması
setInterval(async () => {
    try {
        // İstemci her 2 saniyede bir sunucuya istek atar (Ağ trafiği yaratır)
        const response = await fetch('/api/library/room-status');
        const roomState = await response.json();
        updateUI(roomState);
    } catch (error) {
        console.error("Polling error:", error);
    }
}, 2000);
