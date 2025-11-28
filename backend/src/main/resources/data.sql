-- 마트 정보 (개발자용 seed data)
INSERT INTO stores (name, brand, address, lat, lng)
SELECT '코스트코 부산점', 'COSTCO', '부산 수영구 구락로 137', 35.178555, 129.115388
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '코스트코 부산점');


INSERT INTO stores (name, brand, address, lat, lng)
SELECT '이마트 트레이더스 서면점', 'TRADERS', '부산 부산진구 시민공원로 31', 35.164669, 129.050876
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '이마트 트레이더스 서면점');

INSERT INTO stores (name, brand, address, lat, lng)
SELECT '이마트 트레이더스 연산점', 'TRADERS', '부산 연제구 좌수영로 241', 35.185641, 129.106679
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '이마트 트레이더스 연산점');

INSERT INTO stores (name, brand, address, lat, lng)
SELECT '이마트 트레이더스 명지점', 'TRADERS', '부산 강서구 명지국제6로 168', 35.093358, 128.903567
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '이마트 트레이더스 명지점');

INSERT INTO stores (name, brand, address, lat, lng)
SELECT '롯데마트 맥스 사상점', 'MAXX', '부산 사상구 광장로 7', 35.162237, 128.983196
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '롯데마트 맥스 사상점');

INSERT INTO stores (name, brand, address, lat, lng)
SELECT '롯데마트 맥스 영도점', 'MAXX', '부산 영도구 해양로 30', 35.096232, 129.056450
    WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name = '롯데마트 맥스 영도점');