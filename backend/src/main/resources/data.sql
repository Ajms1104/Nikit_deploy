-- 마트 정보 (개발자용 seed data)
INSERT INTO stores (name, brand, address)
SELECT '코스트코 부산점', 'COSTCO', '부산 수영구 구락로 137'
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '코스트코 부산점');

INSERT INTO stores (name, brand, address)
SELECT '이마트 트레이더스 서면점', 'TRADERS', '부산 부산진구 시민공원로 31'
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '이마트 트레이더스 서면점');