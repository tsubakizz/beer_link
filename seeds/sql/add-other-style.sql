-- 「その他」スタイルを追加
-- 分類が難しいスタイルや新しいスタイルのビールに使用

INSERT INTO beer_styles (name, description, status)
VALUES ('その他', '分類が難しいスタイルや、新しいスタイルのビールはこちらを選択してください。', 'approved')
ON CONFLICT (name) DO NOTHING;
