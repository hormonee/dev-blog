-- 기존 유저(mmmable3@gmail.com)의 profiles 행 생성
-- 마이그레이션 전에 가입한 유저이므로 프로필이 존재하지 않아 닉네임이 표시되지 않던 문제 해결
INSERT INTO profiles (id, nickname)
VALUES ('0dc4bf0b-8dda-41b8-bca1-cc49309f5792', 'JM')
ON CONFLICT (id) DO UPDATE SET nickname = 'JM';
