// MongoDB: Doküman tabanlı güncelleme (Esnek ama transaction yönetimi daha karmaşık)
async function buyItem(userId, itemId, itemCost) {
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (user.points >= itemCost) {
        // Puanı düş ve envanter dizisine yeni eşyayı ekle ($push)
        await db.collection('users').updateOne(
            { _id: userId },
            { 
              $inc: { points: -itemCost },
              $push: { inventory: itemId } 
            }
        );
        return { success: true };
    }
    return { success: false, message: "Not enough points" };
}
