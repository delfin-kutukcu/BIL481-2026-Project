// Socket.io Server-Side: Anlık durum senkronizasyonu (Event-driven push)
io.on('connection', (socket) => {
    socket.on('join_library_desk', (data) => {
        const { userId, deskId, roomId } = data;
        
        // Sunucu durumu günceller ve odadaki HERKESRE anında push eder (0 gecikme)
        roomStates[roomId].updateUserSeat(userId, deskId);
        io.to(roomId).emit('room_state_updated', roomStates[roomId]);
    });
});
