-- PostgreSQL: Atomik ve Güvenli Satın Alma İşlemi (Transaction)
BEGIN;

-- 1. Kullanıcının yeterli puanı var mı ve eşya kilitli mi kontrol et & puanı düş
UPDATE users 
SET points = points - 300 
WHERE id = 105 AND points >= 300;

-- 2. Eşyayı kullanıcının envanterine ekle
INSERT INTO user_inventory (user_id, item_id, acquired_at) 
VALUES (105, 'desk_tier2', NOW());

COMMIT; -- İkisi de başarılı olursa kaydet, hata olursa otomatik ROLLBACK yapar.
