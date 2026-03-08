-- Legacy Data Import SQL Script
-- Generated: 2026-01-15T09:03:35.028Z

BEGIN;

-- Disable triggers to prevent recursion
ALTER TABLE plots DISABLE TRIGGER ALL;
ALTER TABLE allocations DISABLE TRIGGER ALL;
ALTER TABLE allocation_plots DISABLE TRIGGER ALL;


-- ========================================
-- City of David Estate
-- ========================================

-- Customer: EBHOHIMEN OSAZEE LUCKY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EBHOHIMEN OSAZEE LUCKY',
  '7055103016',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_0;

-- Plot: 6B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '6B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_0;

-- Allocation for EBHOHIMEN OSAZEE LUCKY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_0,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-07-29T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_0;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_0;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_0,
  1400000,
  '2024-07-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EMMANUEL EBHOHIMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EMMANUEL EBHOHIMEN',
  '8131673298',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_1;

-- Plot: 5
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '5',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for EMMANUEL EBHOHIMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  plot_id_1,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-07-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_1 WHERE id = plot_id_1;

-- Payment: ₦2,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  allocation_id_1,
  2800000,
  '2024-07-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAMUDIAMEN DAVID
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAMUDIAMEN DAVID',
  '8169863315',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_2;

-- Plot: 4A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '4A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_2;

-- Allocation for OSAMUDIAMEN DAVID
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_2,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-07-30T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_2;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_2;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_2,
  1400000,
  '2024-07-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR and Mrs wilifred  STEPHEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR and Mrs wilifred  STEPHEN',
  '8134429478',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_3;

-- Plot: 4B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '4B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_3;

-- Allocation for MR and Mrs wilifred  STEPHEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_3,
  plot_id_3,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-07-30T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_3;

UPDATE plots SET status = 'sold', customer_id = customer_id_3 WHERE id = plot_id_3;
-- Generated fake phone for CHRISTIAN EMMA: 8000001002

-- Customer: CHRISTIAN EMMA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CHRISTIAN EMMA',
  '8000001002',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_4;

-- Plot: 6A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '6A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_4;

-- Allocation for CHRISTIAN EMMA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  plot_id_4,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-07-30T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_4;

UPDATE plots SET status = 'sold', customer_id = customer_id_4 WHERE id = plot_id_4;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  allocation_id_4,
  1400000,
  '2024-07-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: GIDEON IDEMUDIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'GIDEON IDEMUDIA',
  '9132280930',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: 21
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '21',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for GIDEON IDEMUDIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-07-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦2,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  2800000,
  '2024-07-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ERIC IDEMUDIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ERIC IDEMUDIA',
  '8145719073',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: 7
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '7',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for ERIC IDEMUDIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-08-08T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦2,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  2800000,
  '2024-08-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: BONIFACE OBOYO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'BONIFACE OBOYO',
  '7019226604',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_7;

-- Plot: 10B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '10B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for BONIFACE OBOYO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-08-11T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  1400000,
  '2024-08-11T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ELVIS EZILIWE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ELVIS EZILIWE',
  '8036617524',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_8;

-- Plot: 25
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '25',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_8;

-- Allocation for ELVIS EZILIWE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_8,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-08-08T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_8;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_8;

-- Payment: ₦3,100,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_8,
  3100000,
  '2024-08-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MRS ADESUWA IYONMAHAN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MRS ADESUWA IYONMAHAN',
  '7036610936',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_9;

-- Plot: 11
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '11',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_9;

-- Allocation for MRS ADESUWA IYONMAHAN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  plot_id_9,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-08-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_9;

UPDATE plots SET status = 'sold', customer_id = customer_id_9 WHERE id = plot_id_9;

-- Payment: ₦2,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  allocation_id_9,
  2800000,
  '2024-08-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR SYLVESTER UYIGUE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR SYLVESTER UYIGUE',
  '8145842607',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_10;

-- Plot: 8B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '8B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_10;

-- Allocation for MR SYLVESTER UYIGUE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  plot_id_10,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-08-26T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_10;

UPDATE plots SET status = 'sold', customer_id = customer_id_10 WHERE id = plot_id_10;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  allocation_id_10,
  1400000,
  '2024-08-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR VICTOR OSAYANDE JEROME
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR VICTOR OSAYANDE JEROME',
  '9064129044',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_11;

-- Plot: 9A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '9A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_11;

-- Allocation for MR VICTOR OSAYANDE JEROME
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  plot_id_11,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-08-29T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_11;

UPDATE plots SET status = 'sold', customer_id = customer_id_11 WHERE id = plot_id_11;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  allocation_id_11,
  1400000,
  '2024-08-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OMOLEGHO UGBIJE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OMOLEGHO UGBIJE',
  '8077226688',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_12;

-- Plot: 34a
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '34a',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_12;

-- Allocation for OMOLEGHO UGBIJE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  plot_id_12,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-09-08T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_12;

UPDATE plots SET status = 'sold', customer_id = customer_id_12 WHERE id = plot_id_12;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  allocation_id_12,
  1400000,
  '2024-09-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ADAVBIELE AGBONGHALE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ADAVBIELE AGBONGHALE',
  '9032855815',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_13;

-- Plot: 23
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '23',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_13;

-- Allocation for ADAVBIELE AGBONGHALE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  plot_id_13,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-10-20T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_13;

UPDATE plots SET status = 'sold', customer_id = customer_id_13 WHERE id = plot_id_13;

-- Payment: ₦3,300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  allocation_id_13,
  3300000,
  '2024-10-20T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR. IGBINIGIE SATURDAY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR. IGBINIGIE SATURDAY',
  '8032901492',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_14;

-- Plot: 32
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '32',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_14;

-- Allocation for MR. IGBINIGIE SATURDAY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_14,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-10-22T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_14;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_14;

-- Payment: ₦3,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_14,
  3400000,
  '2024-10-22T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for Mrs Aletor ESEOGHENE: 8000001660

-- Customer: Mrs Aletor ESEOGHENE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Mrs Aletor ESEOGHENE',
  '8000001660',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_15;

-- Plot: 18A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '18A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_15;

-- Allocation for Mrs Aletor ESEOGHENE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  plot_id_15,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2026-01-15T09:03:35.063Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_15;

UPDATE plots SET status = 'sold', customer_id = customer_id_15 WHERE id = plot_id_15;

-- Payment: ₦1,700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  allocation_id_15,
  1700000,
  '2026-01-15T09:03:35.063Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for mr. Langton Isele: 8000001571

-- Customer: mr. Langton Isele
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'mr. Langton Isele',
  '8000001571',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_16;

-- Plot: 31
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '31',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_16;

-- Allocation for mr. Langton Isele
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  plot_id_16,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-10-25T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_16;

UPDATE plots SET status = 'sold', customer_id = customer_id_16 WHERE id = plot_id_16;

-- Payment: ₦3,300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  allocation_id_16,
  3300000,
  '2024-10-25T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: Miss JIMOH FUNKE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Miss JIMOH FUNKE',
  '8029778859',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_17;

-- Plot: 35
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '35',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_17;

-- Allocation for Miss JIMOH FUNKE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_17,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-11-10T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_17;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_17;

-- Payment: ₦4,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_17,
  4000000,
  '2024-11-10T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: NANCY SLYVESTER
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NANCY SLYVESTER',
  '8132514145',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_18;

-- Plot: 18B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '18B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_18;

-- Allocation for NANCY SLYVESTER
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  plot_id_18,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-06-11T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_18;

UPDATE plots SET status = 'sold', customer_id = customer_id_18 WHERE id = plot_id_18;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  allocation_id_18,
  1800000,
  '2024-06-11T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: AGBAKUR DESTINY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AGBAKUR DESTINY',
  '8061939302',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_19;

-- Plot: 46
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '46',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_19;

-- Allocation for AGBAKUR DESTINY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_19,
  plot_id_19,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-12-13T23:00:00.000Z',
  'Referred by: Mr Saturday',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_19;

UPDATE plots SET status = 'sold', customer_id = customer_id_19 WHERE id = plot_id_19;

-- Payment: ₦3,900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_19,
  allocation_id_19,
  3900000,
  '2024-12-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for REON OTSU: 8000000692

-- Customer: REON OTSU
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'REON OTSU',
  '8000000692',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_20;

-- Plot: 17B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '17B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_20;

-- Allocation for REON OTSU
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  plot_id_20,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2024-11-08T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_20;

UPDATE plots SET status = 'sold', customer_id = customer_id_20 WHERE id = plot_id_20;

-- Payment: ₦1,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  allocation_id_20,
  1500000,
  '2024-11-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IKHANOBA LOVETH AZIMEYELE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IKHANOBA LOVETH AZIMEYELE',
  '8033620874',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_23;

-- Plot: 17A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '17A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_23;

-- Allocation for IKHANOBA LOVETH AZIMEYELE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  plot_id_23,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-02-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_23;

UPDATE plots SET status = 'sold', customer_id = customer_id_23 WHERE id = plot_id_23;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  allocation_id_23,
  500000,
  '2025-02-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦1,200,000,240
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_23,
  '12_months',
  1200500240,
  '2025-02-28T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: KENNETH OSARO ASUENIMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'KENNETH OSARO ASUENIMEN',
  '8130033908',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_24;

-- Plot: 48
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '48',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_24;

-- Allocation for KENNETH OSARO ASUENIMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_24,
  plot_id_24,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-01-08T23:00:00.000Z',
  'Referred by: Mr Happy LFC',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_24;

UPDATE plots SET status = 'sold', customer_id = customer_id_24 WHERE id = plot_id_24;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_24,
  allocation_id_24,
  3600000,
  '2025-01-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAYAMEN O. IGIEBOR
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAYAMEN O. IGIEBOR',
  '8078263699',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_25;

-- Plot: 19B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '19B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_25;

-- Allocation for OSAYAMEN O. IGIEBOR
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  plot_id_25,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-01-15T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_25;

UPDATE plots SET status = 'sold', customer_id = customer_id_25 WHERE id = plot_id_25;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  allocation_id_25,
  1000000,
  '2025-01-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: JOE PRECIOUS
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'JOE PRECIOUS',
  '8107663301',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_26;

-- Plot: 33
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '33',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_26;

-- Allocation for JOE PRECIOUS
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_26,
  plot_id_26,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-02-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_26;

UPDATE plots SET status = 'sold', customer_id = customer_id_26 WHERE id = plot_id_26;

-- Payment: ₦2,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_26,
  allocation_id_26,
  2800000,
  '2025-02-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: UMEH NNAMDI JOHN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'UMEH NNAMDI JOHN',
  '8022107871',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_27;

-- Plot: 34B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '34B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_27;

-- Allocation for UMEH NNAMDI JOHN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_27,
  plot_id_27,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-03-16T23:00:00.000Z',
  'Referred by: Miss Obianuju | Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_27;

UPDATE plots SET status = 'sold', customer_id = customer_id_27 WHERE id = plot_id_27;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_27,
  allocation_id_27,
  1800000,
  '2025-03-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for NWANUGO NNAMDI STANLEY: 8000001619

-- Customer: NWANUGO NNAMDI STANLEY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NWANUGO NNAMDI STANLEY',
  '8000001619',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_28;

-- Plot: 20
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '20',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_28;

-- Allocation for NWANUGO NNAMDI STANLEY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_28,
  plot_id_28,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-03-16T23:00:00.000Z',
  'Referred by: Miss Obianuju',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_28;

UPDATE plots SET status = 'sold', customer_id = customer_id_28 WHERE id = plot_id_28;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_28,
  allocation_id_28,
  3600000,
  '2025-03-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 19A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '19A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_29;

-- Allocation for MR IGBINIGIE SATURDAY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_29,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-03-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_29;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_29;

-- Payment: ₦1,700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_29,
  1700000,
  '2025-03-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: Mr. OMORUYI EHI GODREY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Mr. OMORUYI EHI GODREY',
  '8052572915',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_30;

-- Plot: 47
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '47',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_30;

-- Allocation for Mr. OMORUYI EHI GODREY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_30,
  plot_id_30,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-04-08T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_30;

UPDATE plots SET status = 'sold', customer_id = customer_id_30 WHERE id = plot_id_30;

-- Payment: ₦3,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_30,
  allocation_id_30,
  3000000,
  '2025-04-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Skipped refunded transaction for MRS. OMORUYI ANGELA

-- Customer: MR IKPONMWOSA EDOWAYE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR IKPONMWOSA EDOWAYE',
  '8032645937',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_32;

-- Plot: 3
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '3',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_32;

-- Allocation for MR IKPONMWOSA EDOWAYE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  plot_id_32,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-04-08T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_32;

UPDATE plots SET status = 'sold', customer_id = customer_id_32 WHERE id = plot_id_32;

-- Payment: ₦3,450,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  allocation_id_32,
  3450000,
  '2025-04-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 49A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '49A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_33;

-- Allocation for MRS SANDRA EDOWAYE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  plot_id_33,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-04-08T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_33;

UPDATE plots SET status = 'sold', customer_id = customer_id_32 WHERE id = plot_id_33;

-- Payment: ₦1,700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  allocation_id_33,
  1700000,
  '2025-04-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: UMEH U. VICTORIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'UMEH U. VICTORIA',
  '8037452560',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_34;

-- Plot: 50
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '50',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_34;

-- Allocation for UMEH U. VICTORIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_34,
  plot_id_34,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-04-09T23:00:00.000Z',
  'Referred by: Miss Obianuju',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_34;

UPDATE plots SET status = 'sold', customer_id = customer_id_34 WHERE id = plot_id_34;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_34,
  allocation_id_34,
  3600000,
  '2025-04-09T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OAIHIMIRE BENSON
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OAIHIMIRE BENSON',
  '7052999466',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_35;

-- Plot: 52
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '52',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_35;

-- Allocation for OAIHIMIRE BENSON
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_35,
  plot_id_35,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-04-27T23:00:00.000Z',
  'Referred by: Mr Zion',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_35;

UPDATE plots SET status = 'sold', customer_id = customer_id_35 WHERE id = plot_id_35;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_35,
  allocation_id_35,
  3600000,
  '2025-04-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 37
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '37',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_36;

-- Allocation for OKUDAYE OSAMUDIAMEN GOLD
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  plot_id_36,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-05-06T23:00:00.000Z',
  'Referred by: Mrs Sandra',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_36;

UPDATE plots SET status = 'sold', customer_id = customer_id_32 WHERE id = plot_id_36;

-- Payment: ₦3,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  allocation_id_36,
  3500000,
  '2025-05-06T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 36
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '36',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_37;

-- Allocation for UMEH U. VICTORIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_34,
  plot_id_37,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-05-23T23:00:00.000Z',
  'Referred by: Miss Obianuju',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_37;

UPDATE plots SET status = 'sold', customer_id = customer_id_34 WHERE id = plot_id_37;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_34,
  allocation_id_37,
  3600000,
  '2025-05-23T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: DJIMENE ERUBASA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'DJIMENE ERUBASA',
  '8035267064',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_38;

-- Plot: 38A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '38A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_38;

-- Allocation for DJIMENE ERUBASA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_38,
  plot_id_38,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-05-26T23:00:00.000Z',
  'Referred by: Miss Obianuju | Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_38;

UPDATE plots SET status = 'sold', customer_id = customer_id_38 WHERE id = plot_id_38;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_38,
  allocation_id_38,
  2000000,
  '2025-05-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IDODO-UMEH EFE SOPHIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IDODO-UMEH EFE SOPHIA',
  '8057440582',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_39;

-- Plot: 38B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '38B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_39;

-- Allocation for IDODO-UMEH EFE SOPHIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_39,
  plot_id_39,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-05-27T23:00:00.000Z',
  'Referred by: Miss Obianuju | Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_39;

UPDATE plots SET status = 'sold', customer_id = customer_id_39 WHERE id = plot_id_39;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_39,
  allocation_id_39,
  2000000,
  '2025-05-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: NNAJI CHISOM
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NNAJI CHISOM',
  '8119011023',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_40;

-- Plot: 49B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '49B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_40;

-- Allocation for NNAJI CHISOM
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_40,
  plot_id_40,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-05-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_40;

UPDATE plots SET status = 'sold', customer_id = customer_id_40 WHERE id = plot_id_40;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_40,
  allocation_id_40,
  1800000,
  '2025-05-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for KINGSTONE BLESSING FRIDAY: 8000001842

-- Customer: KINGSTONE BLESSING FRIDAY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'KINGSTONE BLESSING FRIDAY',
  '8000001842',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_41;

-- Plot: 51
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'c03c9e69-3482-4264-adc1-38bdea528494',
  '51',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_41;

-- Allocation for KINGSTONE BLESSING FRIDAY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_41,
  plot_id_41,
  'c03c9e69-3482-4264-adc1-38bdea528494',
  'approved',
  '2025-12-07T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_41;

UPDATE plots SET status = 'sold', customer_id = customer_id_41 WHERE id = plot_id_41;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_41,
  allocation_id_41,
  1000000,
  '2025-12-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦3,000,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_41,
  '12_months',
  4000000,
  '2025-12-07T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- ========================================
-- Ehi Green Park Estate
-- ========================================

-- Customer: EHIGIATOR STANLEY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EHIGIATOR STANLEY',
  '393896413034',
  'EGBA JUNCTION BENIN',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_0;

-- Plot: 16
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '16',
  '100\100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_0;

-- Allocation for EHIGIATOR STANLEY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_0,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2024-09-24T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_0;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_0;

-- Payment: ₦1,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_0,
  1600000,
  '2024-09-24T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EMEGHA JOSEPH ONYEKA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EMEGHA JOSEPH ONYEKA',
  '8068930891',
  'OGBESON QUARTERS',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_1;

-- Plot: 9
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '9',
  '100\100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for EMEGHA JOSEPH ONYEKA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  plot_id_1,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2024-10-25T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_1 WHERE id = plot_id_1;

-- Payment: ₦1,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  allocation_id_1,
  1600000,
  '2024-10-25T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EHIGIE BUNMI PROSPER
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EHIGIE BUNMI PROSPER',
  '8120058371',
  'ADOLOR COLLEGE ROAD',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_2;

-- Plot: 13A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '13A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_2;

-- Allocation for EHIGIE BUNMI PROSPER
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_2,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2024-10-27T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_2;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_2;

-- Payment: ₦850,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_2,
  850000,
  '2024-10-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EMMANUEL JOHN ASUKE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EMMANUEL JOHN ASUKE',
  '8136562059',
  'OJO, LAGOS STATE',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: 13B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '13B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for EMMANUEL JOHN ASUKE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-01-07T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  900000,
  '2025-01-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EHIOZE OSAGIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EHIOZE OSAGIE',
  '8167159631',
  ' 2, Aduwa Strt, Aerodrome close',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: 14
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '14',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for EHIOZE OSAGIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-02-10T23:00:00.000Z',
  'Referred by: MR, RAZAK',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  1800000,
  '2025-02-10T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: LUCKY EWERE EMUZE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'LUCKY EWERE EMUZE',
  '447459010924',
  '3 Awo street off Ogbelaka',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_7;

-- Plot: 10&11
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '10&11',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for LUCKY EWERE EMUZE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-02-12T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦3,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  3000000,
  '2025-02-12T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: UMUEBE RITA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'UMUEBE RITA',
  '8153717283',
  '1 Jude Airhia Street',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_8;

-- Plot: 22
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '22',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_8;

-- Allocation for UMUEBE RITA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_8,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-02-16T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_8;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_8;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_8,
  1800000,
  '2025-02-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for NOSA EGHAREVBA: 8000001034

-- Customer: NOSA EGHAREVBA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NOSA EGHAREVBA',
  '8000001034',
  '8 Agbontean Street',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_9;

-- Plot: 30/31
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '30/31',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_9;

-- Allocation for NOSA EGHAREVBA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  plot_id_9,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-02-17T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_9;

UPDATE plots SET status = 'sold', customer_id = customer_id_9 WHERE id = plot_id_9;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  allocation_id_9,
  3600000,
  '2025-02-17T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ESIOLEE FLORENCE OMOZUANVBO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ESIOLEE FLORENCE OMOZUANVBO',
  '7058781841',
  '6 Albert str,off PZ, off Sapele road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_10;

-- Plot: 15
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '15',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_10;

-- Allocation for ESIOLEE FLORENCE OMOZUANVBO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  plot_id_10,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-03-05T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_10;

UPDATE plots SET status = 'sold', customer_id = customer_id_10 WHERE id = plot_id_10;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  allocation_id_10,
  2000000,
  '2025-03-05T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ISAAC  OKOJIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ISAAC  OKOJIE',
  '8062808616',
  ' 3, PartrickEhimen, off 1st Ugbor Road, G.R.A',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_11;

-- Plot: 26
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '26',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_11;

-- Allocation for ISAAC  OKOJIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  plot_id_11,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-04-13T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_11;

UPDATE plots SET status = 'sold', customer_id = customer_id_11 WHERE id = plot_id_11;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  allocation_id_11,
  500000,
  '2025-04-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦1,500,000,300
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_11,
  '12_months',
  1500500300,
  '2025-04-13T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: ANOGWI SARAH OSEOJE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ANOGWI SARAH OSEOJE',
  '8164456755',
  '1 Charles, Ebun-Amu, Close to Badore, Ajah, Lagos',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_12;

-- Plot: 27
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '27',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_12;

-- Allocation for ANOGWI SARAH OSEOJE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  plot_id_12,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-04-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_12;

UPDATE plots SET status = 'sold', customer_id = customer_id_12 WHERE id = plot_id_12;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  allocation_id_12,
  2000000,
  '2025-04-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OGHAGBON KATE OSARUMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OGHAGBON KATE OSARUMEN',
  '8075028507',
  '16 Eke street off upper sakponba B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_13;

-- Plot: 12
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '12',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_13;

-- Allocation for OGHAGBON KATE OSARUMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  plot_id_13,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-01T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_13;

UPDATE plots SET status = 'sold', customer_id = customer_id_13 WHERE id = plot_id_13;

-- Payment: ₦1,850,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  allocation_id_13,
  1850000,
  '2025-05-01T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IVIE OMORODION
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IVIE OMORODION',
  '7051759992',
  'Godwin Oshawo Str, off Igbinosa, off Irhirhi,GRA',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_14;

-- Plot: 37A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '37A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_14;

-- Allocation for IVIE OMORODION
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_14,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-13T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_14;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_14;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_14,
  1000000,
  '2025-05-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: HON. ESOSA NOSA ODIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'HON. ESOSA NOSA ODIA',
  '7036429285',
  '6, Igbinoghodua(Surveyor) Str, Urora',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_15;

-- Plot: 36/38
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '36/38',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_15;

-- Allocation for HON. ESOSA NOSA ODIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  plot_id_15,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-15T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_15;

UPDATE plots SET status = 'sold', customer_id = customer_id_15 WHERE id = plot_id_15;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  allocation_id_15,
  3600000,
  '2025-05-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ISOKEN  NOSA ODIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ISOKEN  NOSA ODIA',
  '8162528131',
  '6, Igbinoghodua(Surveyor) Str, Urora',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_16;

-- Plot: 34
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '34',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_16;

-- Allocation for ISOKEN  NOSA ODIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  plot_id_16,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-15T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_16;

UPDATE plots SET status = 'sold', customer_id = customer_id_16 WHERE id = plot_id_16;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  allocation_id_16,
  1800000,
  '2025-05-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAMWONYI NOSA ODIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAMWONYI NOSA ODIA',
  '3526661140619',
  '6, Igbinoghodua(Surveyor) Str, Urora',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_17;

-- Plot: 35
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '35',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_17;

-- Allocation for OSAMWONYI NOSA ODIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_17,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-15T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_17;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_17;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_17,
  1800000,
  '2025-05-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for BLDR OSAYOMWANBOR & MRS NOSA ODIA: 8000002312

-- Customer: BLDR OSAYOMWANBOR & MRS NOSA ODIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'BLDR OSAYOMWANBOR & MRS NOSA ODIA',
  '8000002312',
  '15, Jubilee str, Evbukhu, Sapele rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_18;

-- Plot: 39
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '39',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_18;

-- Allocation for BLDR OSAYOMWANBOR & MRS NOSA ODIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  plot_id_18,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-15T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_18;

UPDATE plots SET status = 'sold', customer_id = customer_id_18 WHERE id = plot_id_18;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  allocation_id_18,
  1800000,
  '2025-05-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 37B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '37B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_19;

-- Allocation for OBOYO BONIFACE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_19,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-15T23:00:00.000Z',
  'Referred by: MR. OSAS | Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_19;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_19;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_19,
  1400000,
  '2025-05-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: BAMISAYE OLUWASOJI MICHEAL
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'BAMISAYE OLUWASOJI MICHEAL',
  '8054053703',
  '17, Igbinosa str, off irhirhi airport rd B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_20;

-- Plot: 20
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '20',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_20;

-- Allocation for BAMISAYE OLUWASOJI MICHEAL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  plot_id_20,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-05-26T23:00:00.000Z',
  'Referred by: MR GOODLUCK',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_20;

UPDATE plots SET status = 'sold', customer_id = customer_id_20 WHERE id = plot_id_20;

-- Payment: ₦2,200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  allocation_id_20,
  2200000,
  '2025-05-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OMONZOJE IRABOR MICHAEL
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OMONZOJE IRABOR MICHAEL',
  '8101860979',
  'Okhabere str, Sapele B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_21;

-- Plot: 29A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '29A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_21;

-- Allocation for OMONZOJE IRABOR MICHAEL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  plot_id_21,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-06-02T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_21;

UPDATE plots SET status = 'sold', customer_id = customer_id_21 WHERE id = plot_id_21;

-- Payment: ₦1,200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  allocation_id_21,
  1200000,
  '2025-06-02T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MAKINDE PRINCESS TEMITAYO: 8000001869

-- Customer: MAKINDE PRINCESS TEMITAYO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MAKINDE PRINCESS TEMITAYO',
  '8000001869',
  'Osarentin street',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_22;

-- Plot: 21
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '21',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_22;

-- Allocation for MAKINDE PRINCESS TEMITAYO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  plot_id_22,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-06-30T23:00:00.000Z',
  'Referred by: MS. CHARITY',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_22;

UPDATE plots SET status = 'sold', customer_id = customer_id_22 WHERE id = plot_id_22;

-- Payment: ₦2,300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  allocation_id_22,
  2300000,
  '2025-06-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for ALABOR BRIGHT IDAHOSA: 8000001516

-- Customer: ALABOR BRIGHT IDAHOSA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ALABOR BRIGHT IDAHOSA',
  '8000001516',
  '32, Edo street, Upper Sakponba rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_23;

-- Plot: 28
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '28',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_23;

-- Allocation for ALABOR BRIGHT IDAHOSA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  plot_id_23,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-10-01T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_23;

UPDATE plots SET status = 'sold', customer_id = customer_id_23 WHERE id = plot_id_23;

-- Payment: ₦3,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  allocation_id_23,
  3000000,
  '2025-10-01T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EJALE ANNE EGHONGHON
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EJALE ANNE EGHONGHON',
  '8169595757',
  '18, enoma street, Gra. B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_24;

-- Plot: 2
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  '2',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_24;

-- Allocation for EJALE ANNE EGHONGHON
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_24,
  plot_id_24,
  '1728541b-d6f1-4880-a0d1-cdc7379ed58f',
  'approved',
  '2025-12-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_24;

UPDATE plots SET status = 'sold', customer_id = customer_id_24 WHERE id = plot_id_24;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_24,
  allocation_id_24,
  900000,
  '2025-12-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦2,600,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_24,
  '12_months',
  3500000,
  '2025-12-30T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- ========================================
-- Hectares of Diamond Estate
-- ========================================

-- Customer: FAVOUR OMOZOKPIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'FAVOUR OMOZOKPIA',
  '8109747126',
  '4, KB Street,Off Amufi, Off Benin-Agbor rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_0;

-- Plot: TEMP-1000
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1000',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_0;

-- Allocation for FAVOUR OMOZOKPIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_0,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-11-13T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_0;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_0;

-- Payment: ₦650,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_0,
  650000,
  '2025-11-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for EKATA LUCKY AKHERE: 8000001315

-- Customer: EKATA LUCKY AKHERE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EKATA LUCKY AKHERE',
  '8000001315',
  '9, Ebozele, Uromi, ',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_1;

-- Plot: TEMP-1001
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1001',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for EKATA LUCKY AKHERE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  plot_id_1,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-11-13T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_1 WHERE id = plot_id_1;

-- Payment: ₦300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  allocation_id_1,
  300000,
  '2025-11-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦350,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_1,
  '12_months',
  650000,
  '2025-11-13T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: OSAYANDE OLAYE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAYANDE OLAYE',
  '8033868548',
  '3, Jegede Street, Off Upper Forestry',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_2;

-- Plot: TEMP-1002
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1002',
  '20 Plots',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_2;

-- Allocation for OSAYANDE OLAYE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_2,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-11-16T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_2;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_2;

-- Payment Plan: Balance ₦20,000,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_2,
  '12_months',
  20000000,
  '2025-11-16T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: JOY IGBEMIE IKPEFA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'JOY IGBEMIE IKPEFA',
  '8141607672',
  '2, Iviagbe quarters, Ihievbe',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_3;

-- Plot: TEMP-1003
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1003',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_3;

-- Allocation for JOY IGBEMIE IKPEFA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_3,
  plot_id_3,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-11-20T23:00:00.000Z',
  'Referred by: Ms. Charity',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_3;

UPDATE plots SET status = 'sold', customer_id = customer_id_3 WHERE id = plot_id_3;

-- Payment: ₦650,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_3,
  allocation_id_3,
  650000,
  '2025-11-20T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: LAWRENTA AKAHOMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'LAWRENTA AKAHOMEN',
  '8100334589',
  'Mobil Road, Benin City, Edo State',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_4;

-- Plot: TEMP-1004
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1004',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_4;

-- Allocation for LAWRENTA AKAHOMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  plot_id_4,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-11-27T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_4;

UPDATE plots SET status = 'sold', customer_id = customer_id_4 WHERE id = plot_id_4;

-- Payment: ₦1,300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  allocation_id_4,
  1300000,
  '2025-11-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: AIYOBAGIEGBE IHENEGBE LUCKY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AIYOBAGIEGBE IHENEGBE LUCKY',
  '8039291652',
  '12, Mission Road, Oliha Qtrs, Udo-Ovia SouthWest',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: TEMP-1005
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1005',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for AIYOBAGIEGBE IHENEGBE LUCKY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-11-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦1,300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  1300000,
  '2025-11-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for ITODO JACOB: 8000000840

-- Customer: ITODO JACOB
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ITODO JACOB',
  '8000000840',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: TEMP-1006
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1006',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for ITODO JACOB
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-12-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦650,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  650000,
  '2025-12-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for CHRISTPHOER JOYCE: 8000001328

-- Customer: CHRISTPHOER JOYCE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CHRISTPHOER JOYCE',
  '8000001328',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_7;

-- Plot: TEMP-1007
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'TEMP-1007',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for CHRISTPHOER JOYCE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  '2baa338f-bcc7-4cda-ab73-2bed010209ae',
  'approved',
  '2025-12-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦650,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  650000,
  '2025-12-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- ========================================
-- New Era of Wealth Estate
-- ========================================
-- Generated fake phone for KENENUWA OMUDU JUILET NGOZI: 8000002024

-- Customer: KENENUWA OMUDU JUILET NGOZI
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'KENENUWA OMUDU JUILET NGOZI',
  '8000002024',
  '22, Queen Ede Street, Off Benin-Agbor',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_0;

-- Plot: TEMP-1000
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'TEMP-1000',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_0;

-- Allocation for KENENUWA OMUDU JUILET NGOZI
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_0,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-07T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_0;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_0;

-- Payment: ₦7,300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_0,
  7300000,
  '2025-02-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for SYLVIA OSARIEMEN: 8000001256

-- Customer: SYLVIA OSARIEMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'SYLVIA OSARIEMEN',
  '8000001256',
  '22, Queen Ede Street, Off Benin-Agbor',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_1;

-- Plot: TEMP-1001
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'TEMP-1001',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for SYLVIA OSARIEMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  plot_id_1,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-07T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_1 WHERE id = plot_id_1;

-- Payment: ₦3,650,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  allocation_id_1,
  3650000,
  '2025-02-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: AMADIN OSAHENOMA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AMADIN OSAHENOMA',
  '8158367430',
  '2, Messiah Street, Sakponba Road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_2;

-- Plot: 15B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '15B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_2;

-- Allocation for AMADIN OSAHENOMA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_2,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-07T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_2;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_2;

-- Payment: ₦700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_2,
  700000,
  '2025-02-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OWIE DAVID OSARO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OWIE DAVID OSARO',
  '8147517101',
  '28, Police Strt, Benin-Agbor Road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_3;

-- Plot: 19
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '19',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_3;

-- Allocation for OWIE DAVID OSARO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_3,
  plot_id_3,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-09T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_3;

UPDATE plots SET status = 'sold', customer_id = customer_id_3 WHERE id = plot_id_3;

-- Payment: ₦1,200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_3,
  allocation_id_3,
  1200000,
  '2025-02-09T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: JUDE THOMAS ORIABIOJIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'JUDE THOMAS ORIABIOJIE',
  '7059399955',
  '4, Osariemhen street, off Benin Agbor road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_4;

-- Plot: 13
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '13',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_4;

-- Allocation for JUDE THOMAS ORIABIOJIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  plot_id_4,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-17T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_4;

UPDATE plots SET status = 'sold', customer_id = customer_id_4 WHERE id = plot_id_4;

-- Payment: ₦730,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  allocation_id_4,
  730000,
  '2025-02-17T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ABDUL YAHAYA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ABDUL YAHAYA',
  '9150352282',
  '4, Kb str, off Amufi, off Benin-Agbor road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: 29B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '29B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for ABDUL YAHAYA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-19T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦772,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  772000,
  '2025-02-19T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OMINU JULIET OFURE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OMINU JULIET OFURE',
  '9034373908',
  'Benin city, Nigeria',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: 29A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '29A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for OMINU JULIET OFURE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-23T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦750,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  750000,
  '2025-02-23T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IKECHUKWU DANIEL ONYEDIKACHI
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IKECHUKWU DANIEL ONYEDIKACHI',
  '7035818776',
  'Urora, Auchi Road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_7;

-- Plot: 14A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '14A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for IKECHUKWU DANIEL ONYEDIKACHI
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-02-26T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  700000,
  '2025-02-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for AIGBEDE ESTHER: 8000001056

-- Customer: AIGBEDE ESTHER
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AIGBEDE ESTHER',
  '8000001056',
  '55 Isibor Street',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_8;

-- Plot: 14B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '14B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_8;

-- Allocation for AIGBEDE ESTHER
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_8,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-03-02T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_8;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_8;

-- Payment: ₦600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_8,
  600000,
  '2025-03-02T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EHIMAMIEGHO AIMUAMWOSA ROLAND
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EHIMAMIEGHO AIMUAMWOSA ROLAND',
  '8059780389',
  '13 Usiere street off ogiemwenkem',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_9;

-- Plot: 15A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '15A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_9;

-- Allocation for EHIMAMIEGHO AIMUAMWOSA ROLAND
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  plot_id_9,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-03-02T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_9;

UPDATE plots SET status = 'sold', customer_id = customer_id_9 WHERE id = plot_id_9;

-- Payment: ₦350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  allocation_id_9,
  350000,
  '2025-03-02T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦45,000,090
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_9,
  '12_months',
  45350090,
  '2025-03-02T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: KINGDOM IJIEBOR
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'KINGDOM IJIEBOR',
  '8074252898',
  '23, Gapiano Avenue, GRA 13/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_10;

-- Plot: 20
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '20',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_10;

-- Allocation for KINGDOM IJIEBOR
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  plot_id_10,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-03-09T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_10;

UPDATE plots SET status = 'sold', customer_id = customer_id_10 WHERE id = plot_id_10;

-- Payment: ₦800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  allocation_id_10,
  800000,
  '2025-03-09T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦80,000,080
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_10,
  '12_months',
  80800080,
  '2025-03-09T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: DOROTHY ABU  OFENMU
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'DOROTHY ABU  OFENMU',
  '8118208194',
  'Nitost  Quarters, Egor',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_11;

-- Plot: 28A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '28A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_11;

-- Allocation for DOROTHY ABU  OFENMU
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  plot_id_11,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-03-13T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_11;

UPDATE plots SET status = 'sold', customer_id = customer_id_11 WHERE id = plot_id_11;

-- Payment: ₦800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  allocation_id_11,
  800000,
  '2025-03-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OKOIDEGUN TRUTH OSEMUDIAMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OKOIDEGUN TRUTH OSEMUDIAMEN',
  '9179143400',
  '1, Ekhator str off Ohovbe Rd,Back of Ohen palace',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_12;

-- Plot: 1,7
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '1,7',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_12;

-- Allocation for OKOIDEGUN TRUTH OSEMUDIAMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  plot_id_12,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2026-01-15T09:03:35.068Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_12;

UPDATE plots SET status = 'sold', customer_id = customer_id_12 WHERE id = plot_id_12;

-- Payment: ₦2,300,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  allocation_id_12,
  2300000,
  '2026-01-15T09:03:35.068Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: INEGBENOISE EHIZOJIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'INEGBENOISE EHIZOJIE',
  '9051955763',
  'Ogbomoide, iruekpen, Esan west Edo state',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_13;

-- Plot: 21
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '21',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_13;

-- Allocation for INEGBENOISE EHIZOJIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  plot_id_13,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-04-15T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_13;

UPDATE plots SET status = 'sold', customer_id = customer_id_13 WHERE id = plot_id_13;

-- Payment: ₦800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  allocation_id_13,
  800000,
  '2025-04-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦700,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_13,
  '12_months',
  1500000,
  '2025-04-15T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: IYAMU IGHO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IYAMU IGHO',
  '7061952899',
  '18, Nwoko avenue',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_14;

-- Plot: 35B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '35B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_14;

-- Allocation for IYAMU IGHO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_14,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-05-11T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_14;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_14;

-- Payment: ₦950,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_14,
  950000,
  '2025-05-11T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for NEW BENIN BAPTIST WINNER OF BRAINIAC QUIZ: 8000002930

-- Customer: NEW BENIN BAPTIST WINNER OF BRAINIAC QUIZ
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NEW BENIN BAPTIST WINNER OF BRAINIAC QUIZ',
  '8000002930',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_15;

-- Plot: 35A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '35A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_15;

-- Allocation for NEW BENIN BAPTIST WINNER OF BRAINIAC QUIZ
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  plot_id_15,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-05-27T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_15;

UPDATE plots SET status = 'sold', customer_id = customer_id_15 WHERE id = plot_id_15;

-- Customer: CHIBUZOR NOYE NELSON
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CHIBUZOR NOYE NELSON',
  '7037480225',
  'Waterboard Auchi',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_16;

-- Plot: 52B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '52B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_16;

-- Allocation for CHIBUZOR NOYE NELSON
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  plot_id_16,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-05-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_16;

UPDATE plots SET status = 'sold', customer_id = customer_id_16 WHERE id = plot_id_16;

-- Payment: ₦950,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  allocation_id_16,
  950000,
  '2025-05-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MATTHEW OVBOKHAN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MATTHEW OVBOKHAN',
  '393511338662',
  '56, John str, benin agbor rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_17;

-- Plot: 16
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '16',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_17;

-- Allocation for MATTHEW OVBOKHAN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_17,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2026-01-15T09:03:35.068Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_17;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_17;

-- Payment: ₦1,250,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_17,
  1250000,
  '2026-01-15T09:03:35.068Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 22
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '22',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_18;

-- Allocation for MATTHEW OVBOKHAN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_18,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2026-01-15T09:03:35.068Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_18;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_18;

-- Payment: ₦1,250,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_18,
  1250000,
  '2026-01-15T09:03:35.068Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 23A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '23A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_19;

-- Allocation for IGIEBOR DANIEL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  plot_id_19,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-07-06T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_19;

UPDATE plots SET status = 'sold', customer_id = customer_id_25 WHERE id = plot_id_19;

-- Payment: ₦950,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  allocation_id_19,
  950000,
  '2025-07-06T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 23B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '23B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_20;

-- Allocation for IGIEBOR DAVINA OSAYAMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  plot_id_20,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-07-06T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_20;

UPDATE plots SET status = 'sold', customer_id = customer_id_25 WHERE id = plot_id_20;

-- Payment: ₦950,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  allocation_id_20,
  950000,
  '2025-07-06T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ABIAKAM SUNDAY UDOCHUKWU
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ABIAKAM SUNDAY UDOCHUKWU',
  '8130243127',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_21;

-- Plot: 28B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '28B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_21;

-- Allocation for ABIAKAM SUNDAY UDOCHUKWU
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  plot_id_21,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-10-02T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_21;

UPDATE plots SET status = 'sold', customer_id = customer_id_21 WHERE id = plot_id_21;

-- Payment: ₦1,200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  allocation_id_21,
  1200000,
  '2025-10-02T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: CHINONSO DONATUS OKONGWU
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CHINONSO DONATUS OKONGWU',
  '9060585399',
  'Upper Medical store rd, b/c',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_22;

-- Plot: 34A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '34A',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_22;

-- Allocation for CHINONSO DONATUS OKONGWU
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  plot_id_22,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-11-04T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_22;

UPDATE plots SET status = 'sold', customer_id = customer_id_22 WHERE id = plot_id_22;

-- Payment: ₦960,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  allocation_id_22,
  960000,
  '2025-11-04T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 34B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  '34B',
  'Standard',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_23;

-- Allocation for CHINONSO DONATUS OKONGWU
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  plot_id_23,
  'b77f2bc8-cc32-4e13-83e9-88d198a17e9d',
  'approved',
  '2025-11-04T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_23;

UPDATE plots SET status = 'sold', customer_id = customer_id_22 WHERE id = plot_id_23;

-- Payment: ₦110,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  allocation_id_23,
  110000,
  '2025-11-04T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- ========================================
-- Ose Perfection Garden
-- ========================================

-- Customer: OSADOLOR PRECIOUS NOSA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSADOLOR PRECIOUS NOSA',
  '8050777558',
  ' 6, Deeper life, Uroho Community, off Sapele road bypass,',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_0;

-- Plot: 49
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '49',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_0;

-- Allocation for OSADOLOR PRECIOUS NOSA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_0,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2026-01-15T09:03:35.070Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_0;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_0;

-- Payment: ₦850,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_0,
  850000,
  '2026-01-15T09:03:35.070Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAMUDIAMEN OGHOREYE&FAVOUR UBEDE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAMUDIAMEN OGHOREYE&FAVOUR UBEDE',
  '8131518609',
  '1, First Isohon str, off welfare rd, upper sokponba',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_1;

-- Plot: 173-176 & 155-158
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '173-176 & 155-158',
  '200/400',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for OSAMUDIAMEN OGHOREYE&FAVOUR UBEDE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  plot_id_1,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-17T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_1 WHERE id = plot_id_1;

-- Payment: ₦6,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  allocation_id_1,
  6000000,
  '2025-07-17T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IKPEFA STELLA KEMI
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IKPEFA STELLA KEMI',
  '8167153007',
  '8, Oghoghorierie str, medical store rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_2;

-- Plot: 130A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '130A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_2;

-- Allocation for IKPEFA STELLA KEMI
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_2,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-18T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_2;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_2;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_2,
  425000,
  '2025-07-18T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 131
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '131',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_3;

-- Allocation for OSAYAMEN IGIEBOR
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  plot_id_3,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-19T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_3;

UPDATE plots SET status = 'sold', customer_id = customer_id_25 WHERE id = plot_id_3;

-- Payment: ₦465,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  allocation_id_3,
  465000,
  '2025-07-19T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦385,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_3,
  '12_months',
  850000,
  '2025-07-19T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: ATIVIE EHINEBO HENRY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ATIVIE EHINEBO HENRY',
  '8034902799',
  'Ekose, first boundary rd, Benin Auchi',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_4;

-- Plot: 141B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '141B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_4;

-- Allocation for ATIVIE EHINEBO HENRY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  plot_id_4,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-19T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_4;

UPDATE plots SET status = 'sold', customer_id = customer_id_4 WHERE id = plot_id_4;

-- Payment: ₦335,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  allocation_id_4,
  335000,
  '2025-07-19T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦90,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_4,
  '12_months',
  425000,
  '2025-07-19T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: BOSE IGBINOSA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'BOSE IGBINOSA',
  '393500672890',
  '2b, Atekha lane, off nekpennekpen, 2nd circular',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: 137
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '137',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for BOSE IGBINOSA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-20T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦850,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  850000,
  '2025-07-20T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSARETIN EKHAGUERE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSARETIN EKHAGUERE',
  '393349115614',
  '2b, Atekha lane, off nekpennekpen, 2nd circular',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: 136
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '136',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for OSARETIN EKHAGUERE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-20T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  800000,
  '2025-07-20T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR PETER OJOR AKOSI& MRS FAITH OMO PETER
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR PETER OJOR AKOSI& MRS FAITH OMO PETER',
  '8059966429',
  '9, Imuede str, Egbadu,qrts, Agenebode,Edo state',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_7;

-- Plot: 139A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '139A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for MR PETER OJOR AKOSI& MRS FAITH OMO PETER
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-20T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  425000,
  '2025-07-20T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: AIGBEDE ESTHER
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AIGBEDE ESTHER',
  '8065264874',
  '55, Isibor str, Benin city',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_8;

-- Plot: 139B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '139B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_8;

-- Allocation for AIGBEDE ESTHER
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_8,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-20T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_8;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_8;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_8,
  425000,
  '2025-07-20T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAGHAE EHIGIEGBA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAGHAE EHIGIEGBA',
  '8164610901',
  '2b, Atekha lane, off nekpennekpen, 2nd circular',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_9;

-- Plot: 141A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '141A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_9;

-- Allocation for OSAGHAE EHIGIEGBA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  plot_id_9,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-21T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_9;

UPDATE plots SET status = 'sold', customer_id = customer_id_9 WHERE id = plot_id_9;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  allocation_id_9,
  425000,
  '2025-07-21T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSARUGUE OJO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSARUGUE OJO',
  '8062484087',
  '5, Ikpomwonsa str, off Emumwen str',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_10;

-- Plot: 140
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '140',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_10;

-- Allocation for OSARUGUE OJO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  plot_id_10,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-24T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_10;

UPDATE plots SET status = 'sold', customer_id = customer_id_10 WHERE id = plot_id_10;

-- Payment: ₦850,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  allocation_id_10,
  850000,
  '2025-07-24T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: PATRICK CHINONYE CLAIRE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'PATRICK CHINONYE CLAIRE',
  '9056263795',
  '40, Efevbara str, off sapele rd, b/c',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_11;

-- Plot: 148B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '148B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_11;

-- Allocation for PATRICK CHINONYE CLAIRE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  plot_id_11,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-27T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_11;

UPDATE plots SET status = 'sold', customer_id = customer_id_11 WHERE id = plot_id_11;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  allocation_id_11,
  425000,
  '2025-07-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR & MRS AMINU YAKUBU
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR & MRS AMINU YAKUBU',
  '7030034530',
  '25,Okoro Avenue, Ekosodin, Uniben,ugbowo',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_12;

-- Plot: 147
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '147',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_12;

-- Allocation for MR & MRS AMINU YAKUBU
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  plot_id_12,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-27T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_12;

UPDATE plots SET status = 'sold', customer_id = customer_id_12 WHERE id = plot_id_12;

-- Payment: ₦850,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  allocation_id_12,
  850000,
  '2025-07-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: DIKE EUCHERIA CHINONSO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'DIKE EUCHERIA CHINONSO',
  '8147972848',
  '26, Lord Emmanuel Drive, Airforce, PH, Rivers',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_13;

-- Plot: 138A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '138A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_13;

-- Allocation for DIKE EUCHERIA CHINONSO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  plot_id_13,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_13;

UPDATE plots SET status = 'sold', customer_id = customer_id_13 WHERE id = plot_id_13;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  allocation_id_13,
  425000,
  '2025-07-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: AUGUSTINE OSAIGBOKHAN OJO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AUGUSTINE OSAIGBOKHAN OJO',
  '7063052105',
  '26, Ehigiator str, off Ohovbe rd, Ikpoba hill.',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_14;

-- Plot: 142
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '142',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_14;

-- Allocation for AUGUSTINE OSAIGBOKHAN OJO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_14,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-28T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_14;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_14;

-- Payment: ₦850,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_14,
  850000,
  '2025-07-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IKPOTOKIN HARRISON
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IKPOTOKIN HARRISON',
  '8133207997',
  '22, Unity close Obawole, Ifako Ijaye,Lagos state',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_15;

-- Plot: 148A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '148A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_15;

-- Allocation for IKPOTOKIN HARRISON
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  plot_id_15,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-30T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_15;

UPDATE plots SET status = 'sold', customer_id = customer_id_15 WHERE id = plot_id_15;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  allocation_id_15,
  425000,
  '2025-07-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: PATRICK ALEGBE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'PATRICK ALEGBE',
  '8030720017',
  '24, Otua New site, Ihievbe, Edo state',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_16;

-- Plot: 150B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '150B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_16;

-- Allocation for PATRICK ALEGBE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  plot_id_16,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-30T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_16;

UPDATE plots SET status = 'sold', customer_id = customer_id_16 WHERE id = plot_id_16;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  allocation_id_16,
  425000,
  '2025-07-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 150A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '150A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_17;

-- Allocation for DIKE EUCHERIA CHINONSO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  plot_id_17,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-31T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_17;

UPDATE plots SET status = 'sold', customer_id = customer_id_13 WHERE id = plot_id_17;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  allocation_id_17,
  425000,
  '2025-07-31T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAGUMWENRO AUGUSTINE EMMANUEL
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAGUMWENRO AUGUSTINE EMMANUEL',
  '9067387636',
  '36, Adolor str, off st Saviour rd, upper Sakponba',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_18;

-- Plot: 138B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '138B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_18;

-- Allocation for OSAGUMWENRO AUGUSTINE EMMANUEL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  plot_id_18,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-07-31T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_18;

UPDATE plots SET status = 'sold', customer_id = customer_id_18 WHERE id = plot_id_18;

-- Payment: ₦425,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  allocation_id_18,
  425000,
  '2025-07-31T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 130B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '130B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_19;

-- Allocation for DANIEL IKECHUKWU ONYEDIKACHI
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_19,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-08T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_19;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_19;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_19,
  500000,
  '2025-08-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: DAVID SUNDAY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'DAVID SUNDAY',
  '8035583876',
  '55, upper sakponba rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_20;

-- Plot: 123A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '123A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_20;

-- Allocation for DAVID SUNDAY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  plot_id_20,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-19T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_20;

UPDATE plots SET status = 'sold', customer_id = customer_id_20 WHERE id = plot_id_20;

-- Payment: ₦200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  allocation_id_20,
  200000,
  '2025-08-19T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦300,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_20,
  '12_months',
  500000,
  '2025-08-19T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: OSIOMWAN PATRICIA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSIOMWAN PATRICIA',
  '8133243505',
  'oreahi str, Ugbiyokho, upper Ekewan',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_21;

-- Plot: 123B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '123B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_21;

-- Allocation for OSIOMWAN PATRICIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  plot_id_21,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-20T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_21;

UPDATE plots SET status = 'sold', customer_id = customer_id_21 WHERE id = plot_id_21;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  allocation_id_21,
  500000,
  '2025-08-20T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 122
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '122',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_22;

-- Allocation for ANTHONIA AMADIN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_22,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-22T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_22;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_22;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_22,
  1000000,
  '2025-08-22T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ISRAEL OSAS OYAKHILOME
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ISRAEL OSAS OYAKHILOME',
  '7064959105',
  '7, Sarlyu Olusesi str, Off Hostel bus stop, Lagos',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_23;

-- Plot: 129A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '129A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_23;

-- Allocation for ISRAEL OSAS OYAKHILOME
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  plot_id_23,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-24T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_23;

UPDATE plots SET status = 'sold', customer_id = customer_id_23 WHERE id = plot_id_23;

-- Payment: ₦450,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  allocation_id_23,
  450000,
  '2025-08-24T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OWUNNA IKECHUKWU KINGSLEY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OWUNNA IKECHUKWU KINGSLEY',
  '7041018523',
  '1, Uriamonse str, upper mission extension',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_24;

-- Plot: 146
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '146',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_24;

-- Allocation for OWUNNA IKECHUKWU KINGSLEY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_24,
  plot_id_24,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-24T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_24;

UPDATE plots SET status = 'sold', customer_id = customer_id_24 WHERE id = plot_id_24;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_24,
  allocation_id_24,
  900000,
  '2025-08-24T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: FAITH OSHUARE IKPEFA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'FAITH OSHUARE IKPEFA',
  '7047955358',
  '1, Iviagbe quarters, Ihievbe',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_25;

-- Plot: 132A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '132A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_25;

-- Allocation for FAITH OSHUARE IKPEFA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  plot_id_25,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-25T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_25;

UPDATE plots SET status = 'sold', customer_id = customer_id_25 WHERE id = plot_id_25;

-- Payment: ₦450,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_25,
  allocation_id_25,
  450000,
  '2025-08-25T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: UHUNOMA HOPE OMOLEGHO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'UHUNOMA HOPE OMOLEGHO',
  '8058116036',
  '7a, Eguaoba str, upper Ekewan rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_26;

-- Plot: 132B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '132B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_26;

-- Allocation for UHUNOMA HOPE OMOLEGHO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_26,
  plot_id_26,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-25T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_26;

UPDATE plots SET status = 'sold', customer_id = customer_id_26 WHERE id = plot_id_26;

-- Payment: ₦450,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_26,
  allocation_id_26,
  450000,
  '2025-08-25T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: AWESOME BEATRICE OSARUGUE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AWESOME BEATRICE OSARUGUE',
  '8106540230',
  '49, Erie off Sokponba rd.',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_27;

-- Plot: 124A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '124A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_27;

-- Allocation for AWESOME BEATRICE OSARUGUE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_27,
  plot_id_27,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-08-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_27;

UPDATE plots SET status = 'sold', customer_id = customer_id_27 WHERE id = plot_id_27;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_27,
  allocation_id_27,
  500000,
  '2025-08-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ILOKAWAI CHUKWUMA FAVOUR
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ILOKAWAI CHUKWUMA FAVOUR',
  '8061494802',
  '4, Adun Str, off Ekhator str, Ohovbe qrts',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_28;

-- Plot: 159
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '159',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_28;

-- Allocation for ILOKAWAI CHUKWUMA FAVOUR
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_28,
  plot_id_28,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-07T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_28;

UPDATE plots SET status = 'sold', customer_id = customer_id_28 WHERE id = plot_id_28;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_28,
  allocation_id_28,
  1000000,
  '2025-09-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: FAITH ADESODE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'FAITH ADESODE',
  '7032901739',
  'Sawmill rd, off Auchi rd, Idokpa',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_29;

-- Plot: 160
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '160',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_29;

-- Allocation for FAITH ADESODE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_29,
  plot_id_29,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-07T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_29;

UPDATE plots SET status = 'sold', customer_id = customer_id_29 WHERE id = plot_id_29;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_29,
  allocation_id_29,
  1000000,
  '2025-09-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: INNOCENT OMOAGHE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'INNOCENT OMOAGHE',
  '7067203374',
  '5, Amufi rd off, Agbor rd.',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_30;

-- Plot: 161A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '161A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_30;

-- Allocation for INNOCENT OMOAGHE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_30,
  plot_id_30,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-14T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_30;

UPDATE plots SET status = 'sold', customer_id = customer_id_30 WHERE id = plot_id_30;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_30,
  allocation_id_30,
  500000,
  '2025-09-14T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAGHAE OSAHENRUMWEN KENNEDY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAGHAE OSAHENRUMWEN KENNEDY',
  '8106337016',
  '10, Igbinobaro str, off 1st ugbor',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_31;

-- Plot: 161B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '161B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_31;

-- Allocation for OSAGHAE OSAHENRUMWEN KENNEDY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_31,
  plot_id_31,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-16T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_31;

UPDATE plots SET status = 'sold', customer_id = customer_id_31 WHERE id = plot_id_31;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_31,
  allocation_id_31,
  500000,
  '2025-09-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IGBINOBA PRECIOUS
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IGBINOBA PRECIOUS',
  '8130827958',
  'Wisdom str, 2nd East circular',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_32;

-- Plot: 152A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '152A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_32;

-- Allocation for IGBINOBA PRECIOUS
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  plot_id_32,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-17T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_32;

UPDATE plots SET status = 'sold', customer_id = customer_id_32 WHERE id = plot_id_32;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  allocation_id_32,
  500000,
  '2025-09-17T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OBASOHAN SUZAN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OBASOHAN SUZAN',
  '8146791551',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_33;

-- Plot: 152B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '152B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_33;

-- Allocation for OBASOHAN SUZAN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_33,
  plot_id_33,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-18T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_33;

UPDATE plots SET status = 'sold', customer_id = customer_id_33 WHERE id = plot_id_33;

-- Payment: ₦450,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_33,
  allocation_id_33,
  450000,
  '2025-09-18T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 163
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '163',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_34;

-- Allocation for AUGUSTINE OSAIGBOKAN OJO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_34,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-23T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_34;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_34;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_34,
  1000000,
  '2025-09-23T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 165
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '165',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_35;

-- Allocation for IDEHEN PATIENCE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_35,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_35;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_35;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_35,
  1000000,
  '2025-09-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ELENA OSEREMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ELENA OSEREMEN',
  '9022736357',
  '6, Inegbendion street,off okhelen road, uromi',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_36;

-- Plot: 162
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '162',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_36;

-- Allocation for ELENA OSEREMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_36,
  plot_id_36,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_36;

UPDATE plots SET status = 'sold', customer_id = customer_id_36 WHERE id = plot_id_36;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_36,
  allocation_id_36,
  1000000,
  '2025-09-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: FRANKLIN CHIDOZIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'FRANKLIN CHIDOZIE',
  '7080053869',
  'Nosakhare avenue, evbovbiuke benin city ',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_37;

-- Plot: 164A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '164A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_37;

-- Allocation for FRANKLIN CHIDOZIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_37,
  plot_id_37,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_37;

UPDATE plots SET status = 'sold', customer_id = customer_id_37 WHERE id = plot_id_37;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_37,
  allocation_id_37,
  500000,
  '2025-09-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OJO EFOSA RUTH
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OJO EFOSA RUTH',
  '8136555422',
  'No 5, Ikponmwosa Street, Upper Sakponba Road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_38;

-- Plot: 164B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '164B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_38;

-- Allocation for OJO EFOSA RUTH
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_38,
  plot_id_38,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_38;

UPDATE plots SET status = 'sold', customer_id = customer_id_38 WHERE id = plot_id_38;

-- Payment: ₦250,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_38,
  allocation_id_38,
  250000,
  '2025-09-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦250,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_38,
  '12_months',
  500000,
  '2025-09-28T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: AIGBOGUN JOY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AIGBOGUN JOY',
  '9038507859',
  'Omo street, Ekose village Egba road benin city',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_39;

-- Plot: 166
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '166',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_39;

-- Allocation for AIGBOGUN JOY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_39,
  plot_id_39,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-09-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_39;

UPDATE plots SET status = 'sold', customer_id = customer_id_39 WHERE id = plot_id_39;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_39,
  allocation_id_39,
  1000000,
  '2025-09-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ALABOR BRIGHT IDAHOSA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ALABOR BRIGHT IDAHOSA',
  '9041267880',
  '32, Edo Street, upper sakponba Benin City',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_40;

-- Plot: 125/126
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '125/126',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_40;

-- Allocation for ALABOR BRIGHT IDAHOSA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_40,
  plot_id_40,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-10-01T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_40;

UPDATE plots SET status = 'sold', customer_id = customer_id_40 WHERE id = plot_id_40;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_40,
  allocation_id_40,
  2000000,
  '2025-10-01T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ARASOMWAN PROMISE EMEMA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ARASOMWAN PROMISE EMEMA',
  '7012308181',
  '36,Edomonoyi street deport Benin city',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_41;

-- Plot: 168B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '168B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_41;

-- Allocation for ARASOMWAN PROMISE EMEMA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_41,
  plot_id_41,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-10-03T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_41;

UPDATE plots SET status = 'sold', customer_id = customer_id_41 WHERE id = plot_id_41;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_41,
  allocation_id_41,
  500000,
  '2025-10-03T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for OKOEBOR AUGUSTINE: 8000001396

-- Customer: OKOEBOR AUGUSTINE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OKOEBOR AUGUSTINE',
  '8000001396',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_42;

-- Plot: 185/186/205/206/215
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '185/186/205/206/215',
  '100/500',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_42;

-- Allocation for OKOEBOR AUGUSTINE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_42,
  plot_id_42,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-10-06T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_42;

UPDATE plots SET status = 'sold', customer_id = customer_id_42 WHERE id = plot_id_42;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_42,
  allocation_id_42,
  2000000,
  '2025-10-06T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦4,500,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_42,
  '12_months',
  6500000,
  '2025-10-06T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);
-- Generated fake phone for OSAYANDE OLAYE: 8000001149

-- Customer: OSAYANDE OLAYE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAYANDE OLAYE',
  '8000001149',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_43;

-- Plot: 195-285,286-293, 294-278
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '195-285,286-293, 294-278',
  '50 PLOTS+8',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_43;

-- Allocation for OSAYANDE OLAYE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_43,
  plot_id_43,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-11-16T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_43;

UPDATE plots SET status = 'sold', customer_id = customer_id_43 WHERE id = plot_id_43;

-- Payment: ₦30,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_43,
  allocation_id_43,
  30000000,
  '2025-11-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦40,000,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_43,
  '12_months',
  70000000,
  '2025-11-16T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);
-- Generated fake phone for AIFUWA TREASURE: 8000001240

-- Customer: AIFUWA TREASURE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AIFUWA TREASURE',
  '8000001240',
  '10, Surveyor Str, Urora, off Auchi rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_44;

-- Plot: 145
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '145',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_44;

-- Allocation for AIFUWA TREASURE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_44,
  plot_id_44,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-11-19T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_44;

UPDATE plots SET status = 'sold', customer_id = customer_id_44 WHERE id = plot_id_44;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_44,
  allocation_id_44,
  500000,
  '2025-11-19T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦1,500,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_44,
  '12_months',
  2000000,
  '2025-11-19T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);
-- Generated fake phone for UGBIJE OMOLEGHO: 8000001217

-- Customer: UGBIJE OMOLEGHO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'UGBIJE OMOLEGHO',
  '8000001217',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_45;

-- Plot: 167
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '167',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_45;

-- Allocation for UGBIJE OMOLEGHO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_45,
  plot_id_45,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-11-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_45;

UPDATE plots SET status = 'sold', customer_id = customer_id_45 WHERE id = plot_id_45;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_45,
  allocation_id_45,
  1800000,
  '2025-11-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for STANLEY ODIGIE: 8000001155

-- Customer: STANLEY ODIGIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'STANLEY ODIGIE',
  '8000001155',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_46;

-- Plot: 124B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  '124B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_46;

-- Allocation for STANLEY ODIGIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_46,
  plot_id_46,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-12-07T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_46;

UPDATE plots SET status = 'sold', customer_id = customer_id_46 WHERE id = plot_id_46;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_46,
  allocation_id_46,
  900000,
  '2025-12-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for PATRICK CHIAMAKA: 8000001264

-- Customer: PATRICK CHIAMAKA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'PATRICK CHIAMAKA',
  '8000001264',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_47;

-- Plot: TEMP-1000
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'TEMP-1000',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_47;

-- Allocation for PATRICK CHIAMAKA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_47,
  plot_id_47,
  '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe',
  'approved',
  '2025-12-14T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_47;

UPDATE plots SET status = 'sold', customer_id = customer_id_47 WHERE id = plot_id_47;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_47,
  allocation_id_47,
  1000000,
  '2025-12-14T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- ========================================
-- Soar High Estate
-- ========================================
-- Generated fake phone for MRS EKI OBHOKHAN: 8000001257

-- Customer: MRS EKI OBHOKHAN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MRS EKI OBHOKHAN',
  '8000001257',
  'ENGR JHN STRT,B\C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_0;

-- Plot: 28A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '28A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_0;

-- Allocation for MRS EKI OBHOKHAN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_0,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-12T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_0;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_0;

-- Payment: ₦314,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_0,
  314000,
  '2001-05-12T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 23
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '23',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for MR ELVIS EZILIWE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_1,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-13T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_1;

-- Payment: ₦120,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_1,
  120000,
  '2001-05-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR OSARUGUE OJO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR OSARUGUE OJO',
  '80624844087',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_2;

-- Plot: 7A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '7A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_2;

-- Allocation for MR OSARUGUE OJO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_2,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-14T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_2;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_2;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_2,
  675000,
  '2001-05-14T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 7B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '7B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_3;

-- Allocation for MRS MONICA OJO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_3,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-14T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_3;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_3;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_3,
  675000,
  '2001-05-14T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR MOMODU ADULSHEKUL: 8000001594

-- Customer: MR MOMODU ADULSHEKUL
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR MOMODU ADULSHEKUL',
  '8000001594',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_4;

-- Plot: 28B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '28B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_4;

-- Allocation for MR MOMODU ADULSHEKUL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  plot_id_4,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-15T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_4;

UPDATE plots SET status = 'sold', customer_id = customer_id_4 WHERE id = plot_id_4;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  allocation_id_4,
  675000,
  '2001-05-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR YEMI ADE: 8000000886

-- Customer: MR YEMI ADE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR YEMI ADE',
  '8000000886',
  'ENGR. JOHN STRT.',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: 29A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '29A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for MR YEMI ADE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-16T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  675000,
  '2001-05-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for STANLEY OSATO SAVERO: 8000001616

-- Customer: STANLEY OSATO SAVERO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'STANLEY OSATO SAVERO',
  '8000001616',
  'IYANOMO COMMUNITY.',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: 30B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '30B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for STANLEY OSATO SAVERO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-17T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  675000,
  '2001-05-17T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR NOSA EGHAREVBA: 8000001328

-- Plot: 22
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '22',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for MR NOSA EGHAREVBA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-18T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦1,350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  1350000,
  '2001-05-18T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR MADUKAKU CHINAGOROM: 8000001717

-- Customer: MR MADUKAKU CHINAGOROM
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR MADUKAKU CHINAGOROM',
  '8000001717',
  '8 OGUDU EGBABON STRT',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_8;

-- Plot: 30A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '30A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_8;

-- Allocation for MR MADUKAKU CHINAGOROM
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_8,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2024-05-23T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_8;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_8;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_8,
  675000,
  '2024-05-23T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR EHIAGATOR STANLEY: 8000001584

-- Customer: MR EHIAGATOR STANLEY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR EHIAGATOR STANLEY',
  '8000001584',
  'EGBA JUNCTION',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_9;

-- Plot: 17
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '17',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_9;

-- Allocation for MR EHIAGATOR STANLEY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  plot_id_9,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-23T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_9;

UPDATE plots SET status = 'sold', customer_id = customer_id_9 WHERE id = plot_id_9;

-- Payment: ₦1,350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  allocation_id_9,
  1350000,
  '2001-05-23T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 42 & 43
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '42 & 43',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_10;

-- Allocation for ADESODE FAITH
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_10,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-28T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_10;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_10;

-- Payment: ₦2,700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_10,
  2700000,
  '2001-05-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ARINZE HENRY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ARINZE HENRY',
  '8165922602',
  'IDOKPA',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_11;

-- Plot: 20B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '20B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_11;

-- Allocation for ARINZE HENRY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  plot_id_11,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-26T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_11;

UPDATE plots SET status = 'sold', customer_id = customer_id_11 WHERE id = plot_id_11;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  allocation_id_11,
  675000,
  '2001-05-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EDO BLESSING
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EDO BLESSING',
  '8025500260',
  '20 EGBOR AVENUE,GRA',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_12;

-- Plot: 18
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '18',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_12;

-- Allocation for EDO BLESSING
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  plot_id_12,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_12;

UPDATE plots SET status = 'sold', customer_id = customer_id_12 WHERE id = plot_id_12;

-- Payment: ₦1,350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  allocation_id_12,
  1350000,
  '2001-05-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR MOHAMMED YAKUBU: 8000001433

-- Customer: MR MOHAMMED YAKUBU
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR MOHAMMED YAKUBU',
  '8000001433',
  '1 YAKUBU MOHAMMED CLOSE',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_13;

-- Plot: 9
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '9',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_13;

-- Allocation for MR MOHAMMED YAKUBU
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  plot_id_13,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_13;

UPDATE plots SET status = 'sold', customer_id = customer_id_13 WHERE id = plot_id_13;

-- Payment: ₦1,350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  allocation_id_13,
  1350000,
  '2001-05-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR EHICHIOYA EROMOSELE: 8000001727

-- Customer: MR EHICHIOYA EROMOSELE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR EHICHIOYA EROMOSELE',
  '8000001727',
  'IDOKPA',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_14;

-- Plot: 12
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '12',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_14;

-- Allocation for MR EHICHIOYA EROMOSELE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_14,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_14;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_14;

-- Payment: ₦1,350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_14,
  1350000,
  '2001-05-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR AGBI MARVELOUS: 8000001363

-- Customer: MR AGBI MARVELOUS
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR AGBI MARVELOUS',
  '8000001363',
  'UGBOWO, BENIN CITY',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_15;

-- Plot: 8
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '8',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_15;

-- Allocation for MR AGBI MARVELOUS
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  plot_id_15,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_15;

UPDATE plots SET status = 'sold', customer_id = customer_id_15 WHERE id = plot_id_15;

-- Payment: ₦1,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  allocation_id_15,
  1500000,
  '2001-05-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR AILENUBHU MOSES: 8000001447

-- Customer: MR AILENUBHU MOSES
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR AILENUBHU MOSES',
  '8000001447',
  '85 NEKPEN NEKPEN STRT',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_16;

-- Plot: 10
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '10',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_16;

-- Allocation for MR AILENUBHU MOSES
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  plot_id_16,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_16;

UPDATE plots SET status = 'sold', customer_id = customer_id_16 WHERE id = plot_id_16;

-- Payment: ₦1,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  allocation_id_16,
  1500000,
  '2001-05-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR AILENUBHU ROLAND: 8000001505

-- Customer: MR AILENUBHU ROLAND
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR AILENUBHU ROLAND',
  '8000001505',
  '85 NEKPEN NEKPEN STRT',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_17;

-- Plot: 11
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '11',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_17;

-- Allocation for MR AILENUBHU ROLAND
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_17,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_17;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_17;

-- Payment: ₦1,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_17,
  1500000,
  '2001-05-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MRS OMONFUMA BOSE: 8000001379

-- Customer: MRS OMONFUMA BOSE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MRS OMONFUMA BOSE',
  '8000001379',
  '85 NEKPEN NEKPEN STRT',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_18;

-- Plot: 21
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '21',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_18;

-- Allocation for MRS OMONFUMA BOSE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  plot_id_18,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_18;

UPDATE plots SET status = 'sold', customer_id = customer_id_18 WHERE id = plot_id_18;

-- Payment: ₦1,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_18,
  allocation_id_18,
  1500000,
  '2001-05-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 13A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '13A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_19;

-- Allocation for PST UYI SMITH
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  plot_id_19,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-29T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_19;

UPDATE plots SET status = 'sold', customer_id = customer_id_12 WHERE id = plot_id_19;

-- Payment: ₦750,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  allocation_id_19,
  750000,
  '2001-05-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MRS OSAYAMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MRS OSAYAMEN',
  '8067171998',
  'AGBOR ROAD',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_20;

-- Plot: 13B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '13B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_20;

-- Allocation for MRS OSAYAMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  plot_id_20,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-05-29T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_20;

UPDATE plots SET status = 'sold', customer_id = customer_id_20 WHERE id = plot_id_20;

-- Payment: ₦675,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_20,
  allocation_id_20,
  675000,
  '2001-05-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR LUCKY EWERE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR LUCKY EWERE',
  '7031127545',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_21;

-- Plot: 6 & 36
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '6 & 36',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_21;

-- Allocation for MR LUCKY EWERE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  plot_id_21,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-06-07T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_21;

UPDATE plots SET status = 'sold', customer_id = customer_id_21 WHERE id = plot_id_21;

-- Payment: ₦3,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_21,
  allocation_id_21,
  3000000,
  '2001-06-07T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MRS JUILET OBHOKHAN: 8000001523

-- Customer: MRS JUILET OBHOKHAN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MRS JUILET OBHOKHAN',
  '8000001523',
  'AGBOR ROAD',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_22;

-- Plot: 27A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '27A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_22;

-- Allocation for MRS JUILET OBHOKHAN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  plot_id_22,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-06-08T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_22;

UPDATE plots SET status = 'sold', customer_id = customer_id_22 WHERE id = plot_id_22;

-- Payment: ₦750,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_22,
  allocation_id_22,
  750000,
  '2001-06-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MR EBOSE EHIS
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR EBOSE EHIS',
  '7062825211',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_23;

-- Plot: 16
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '16',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_23;

-- Allocation for MR EBOSE EHIS
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  plot_id_23,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-06-08T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_23;

UPDATE plots SET status = 'sold', customer_id = customer_id_23 WHERE id = plot_id_23;

-- Payment: ₦1,350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_23,
  allocation_id_23,
  1350000,
  '2001-06-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 24B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '24B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_24;

-- Allocation for GIDEON IDEMUDIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_24,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-06-13T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_24;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_24;

-- Payment: ₦750,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_24,
  750000,
  '2001-06-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 24A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '24A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_25;

-- Allocation for ERIC IDEMUDIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_25,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-06-13T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_25;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_25;

-- Payment: ₦750,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_25,
  750000,
  '2001-06-13T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MRS NWANZEKWU JOY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MRS NWANZEKWU JOY',
  '8104457705',
  'SAWMILL, IDOKPA',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_26;

-- Plot: 3
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '3',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_26;

-- Allocation for MRS NWANZEKWU JOY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_26,
  plot_id_26,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-06-19T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_26;

UPDATE plots SET status = 'sold', customer_id = customer_id_26 WHERE id = plot_id_26;

-- Payment: ₦1,350,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_26,
  allocation_id_26,
  1350000,
  '2001-06-19T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 31A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '31A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_27;

-- Allocation for MR EZRA OBHOKHAN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_27,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-07-12T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_27;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_27;

-- Payment: ₦550,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_27,
  550000,
  '2001-07-12T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR AZIEGBE COLLINS: 8000001434

-- Customer: MR AZIEGBE COLLINS
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR AZIEGBE COLLINS',
  '8000001434',
  'ENOGIE PALACE ROAD,EGBA',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_28;

-- Plot: 20A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '20A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_28;

-- Allocation for MR AZIEGBE COLLINS
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_28,
  plot_id_28,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-07-19T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_28;

UPDATE plots SET status = 'sold', customer_id = customer_id_28 WHERE id = plot_id_28;

-- Customer: MR BENJAMIN  BELLO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR BENJAMIN  BELLO',
  '8108857245',
  'ENEZEHINA, OLUKU',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_29;

-- Plot: 19A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '19A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_29;

-- Allocation for MR BENJAMIN  BELLO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_29,
  plot_id_29,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2024-09-08T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_29;

UPDATE plots SET status = 'sold', customer_id = customer_id_29 WHERE id = plot_id_29;

-- Payment: ₦700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_29,
  allocation_id_29,
  700000,
  '2024-09-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦100,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_29,
  '12_months',
  800000,
  '2024-09-08T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: MRS BRAIMOH MAGDALENE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MRS BRAIMOH MAGDALENE',
  '7055125760',
  'Ore-Ogehene, Off TV Road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_30;

-- Plot: 41
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '41',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_30;

-- Allocation for MRS BRAIMOH MAGDALENE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_30,
  plot_id_30,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2024-09-10T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_30;

UPDATE plots SET status = 'sold', customer_id = customer_id_30 WHERE id = plot_id_30;

-- Payment: ₦1,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_30,
  allocation_id_30,
  1600000,
  '2024-09-10T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MAUREEN OBAWEKI
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MAUREEN OBAWEKI',
  '8161290529',
  'Obehi Avenue, 2nd Ugbor, GRA,',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_31;

-- Plot: 2A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '2A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_31;

-- Allocation for MAUREEN OBAWEKI
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_31,
  plot_id_31,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2024-10-08T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_31;

UPDATE plots SET status = 'sold', customer_id = customer_id_31 WHERE id = plot_id_31;

-- Payment: ₦750,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_31,
  allocation_id_31,
  750000,
  '2024-10-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: Bldr BRIAN EFEOSA ENOBABOR
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Bldr BRIAN EFEOSA ENOBABOR',
  '8033122856',
  '7 Otemere Street, Off MM Way',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_32;

-- Plot: 37&38
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '37&38',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_32;

-- Allocation for Bldr BRIAN EFEOSA ENOBABOR
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  plot_id_32,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2024-10-08T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_32;

UPDATE plots SET status = 'sold', customer_id = customer_id_32 WHERE id = plot_id_32;

-- Payment: ₦3,100,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_32,
  allocation_id_32,
  3100000,
  '2024-10-08T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 2B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '2B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_33;

-- Allocation for MR CHARLES ONUOHA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_33,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2024-10-11T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_33;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_33;

-- Payment: ₦800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_33,
  800000,
  '2024-10-11T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ENOMA AIGBEDION
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ENOMA AIGBEDION',
  '7013609535',
  'Idelegbagbon Street, Eyaen, ',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_34;

-- Plot: 40
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '40',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_34;

-- Allocation for ENOMA AIGBEDION
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_34,
  plot_id_34,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2024-10-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_34;

UPDATE plots SET status = 'sold', customer_id = customer_id_34 WHERE id = plot_id_34;

-- Payment: ₦1,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_34,
  allocation_id_34,
  1600000,
  '2024-10-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ETINOSA IMASUEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ETINOSA IMASUEN',
  '7062600842',
  'CUSTOM RD, ADUWAWA',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_35;

-- Plot: 19B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '19B',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_35;

-- Allocation for ETINOSA IMASUEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_35,
  plot_id_35,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-11-24T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_35;

UPDATE plots SET status = 'sold', customer_id = customer_id_35 WHERE id = plot_id_35;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_35,
  allocation_id_35,
  900000,
  '2001-11-24T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OSAS OYANOGHAFO
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OSAS OYANOGHAFO',
  '4915214299157',
  'OKABERE, BENIN CITY',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_36;

-- Plot: 33 & 34
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '33 & 34',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_36;

-- Allocation for OSAS OYANOGHAFO
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_36,
  plot_id_36,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-12-01T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_36;

UPDATE plots SET status = 'sold', customer_id = customer_id_36 WHERE id = plot_id_36;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_36,
  allocation_id_36,
  3600000,
  '2001-12-01T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ODIASE MARVELLOUS AYEMERE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ODIASE MARVELLOUS AYEMERE',
  '9067064315',
  'TEACHERS QUARTERS',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_37;

-- Plot: 35A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '35A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_37;

-- Allocation for ODIASE MARVELLOUS AYEMERE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_37,
  plot_id_37,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-12-15T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_37;

UPDATE plots SET status = 'sold', customer_id = customer_id_37 WHERE id = plot_id_37;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_37,
  allocation_id_37,
  900000,
  '2001-12-15T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 35B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '35B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_38;

-- Allocation for FAVOUR OMOZOPKIA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_38,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2001-12-27T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_38;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_38;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_38,
  900000,
  '2001-12-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Skipped refunded transaction for OSAZEE OSAWANGHEVIAN

-- Customer: RICHARD CELESTINE EROMOSELE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'RICHARD CELESTINE EROMOSELE',
  '8151772983',
  '35 WIRE ROAD',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_42;

-- Plot: 5A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '5A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_42;

-- Allocation for RICHARD CELESTINE EROMOSELE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_42,
  plot_id_42,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-01-22T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_42;

UPDATE plots SET status = 'sold', customer_id = customer_id_42 WHERE id = plot_id_42;

-- Payment: ₦900,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_42,
  allocation_id_42,
  900000,
  '2025-01-22T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: MORGAN PEACE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MORGAN PEACE',
  '8057209944',
  'Ohovbe quarters, B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_43;

-- Plot: 5B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '5B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_43;

-- Allocation for MORGAN PEACE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_43,
  plot_id_43,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-01-22T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_43;

UPDATE plots SET status = 'sold', customer_id = customer_id_43 WHERE id = plot_id_43;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_43,
  allocation_id_43,
  1000000,
  '2025-01-22T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: AKAODAROAGBONVIE BLESSING
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'AKAODAROAGBONVIE BLESSING',
  '393509818620',
  '2, Akugbe street, Obagie community',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_44;

-- Plot: 76/77
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '76/77',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_44;

-- Allocation for AKAODAROAGBONVIE BLESSING
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_44,
  plot_id_44,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-02-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_44;

UPDATE plots SET status = 'sold', customer_id = customer_id_44 WHERE id = plot_id_44;

-- Payment: ₦3,600,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_44,
  allocation_id_44,
  3600000,
  '2025-02-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ABRAHAM KELVIN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ABRAHAM KELVIN',
  '9068336807',
  'No 10 Osubi otuwaar street off Niyi',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_45;

-- Plot: 80A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '80A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_45;

-- Allocation for ABRAHAM KELVIN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_45,
  plot_id_45,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-04-19T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_45;

UPDATE plots SET status = 'sold', customer_id = customer_id_45 WHERE id = plot_id_45;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_45,
  allocation_id_45,
  1000000,
  '2025-04-19T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 50
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '50',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_46;

-- Allocation for UMUEBE RITA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_46,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-04-21T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_46;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_46;

-- Payment: ₦160,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_46,
  160000000,
  '2025-04-21T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: LUCKY OSAZEE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'LUCKY OSAZEE',
  '39350931456',
  '25, Okogie Street Off Agbor Park, B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_47;

-- Plot: 81/82
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '81/82',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_47;

-- Allocation for LUCKY OSAZEE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_47,
  plot_id_47,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-04-23T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_47;

UPDATE plots SET status = 'sold', customer_id = customer_id_47 WHERE id = plot_id_47;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_47,
  allocation_id_47,
  2000000,
  '2025-04-23T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦2,000,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_47,
  '12_months',
  4000000,
  '2025-04-23T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: MR&MRS FRIDAY ZACCHAEUS
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR&MRS FRIDAY ZACCHAEUS',
  '7067010459',
  'Imafidon Street, off Sapele Road, ',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_48;

-- Plot: 52A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '52A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_48;

-- Allocation for MR&MRS FRIDAY ZACCHAEUS
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_48,
  plot_id_48,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-05-18T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_48;

UPDATE plots SET status = 'sold', customer_id = customer_id_48 WHERE id = plot_id_48;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_48,
  allocation_id_48,
  1000000,
  '2025-05-18T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: EFEKELU SUNDAY
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EFEKELU SUNDAY',
  '8075771075',
  'Iyamu str. Off textile mill road B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_49;

-- Plot: 51B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '51B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_49;

-- Allocation for EFEKELU SUNDAY
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_49,
  plot_id_49,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-05-12T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_49;

UPDATE plots SET status = 'sold', customer_id = customer_id_49 WHERE id = plot_id_49;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_49,
  allocation_id_49,
  1000000,
  '2025-05-12T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: ALADE OSAS
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ALADE OSAS',
  '8052175105',
  '100 Feet, St Saviour',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_50;

-- Plot: 29B
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '29B',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_50;

-- Allocation for ALADE OSAS
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_50,
  plot_id_50,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-06-04T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_50;

UPDATE plots SET status = 'sold', customer_id = customer_id_50 WHERE id = plot_id_50;

-- Payment: ₦1,200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_50,
  allocation_id_50,
  1200000,
  '2025-06-04T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: BRIDGET EDOKPAYI GOG GARDEN ESTATE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'BRIDGET EDOKPAYI GOG GARDEN ESTATE',
  '8058057642',
  '12 Owa str,off Iyaro,nnpc filling station',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_51;

-- Plot: 66
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '66',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_51;

-- Allocation for BRIDGET EDOKPAYI GOG GARDEN ESTATE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_51,
  plot_id_51,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-06-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_51;

UPDATE plots SET status = 'sold', customer_id = customer_id_51 WHERE id = plot_id_51;

-- Payment: ₦2,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_51,
  allocation_id_51,
  2000000,
  '2025-06-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: OWEGIE AGHAMA MICHAEL
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OWEGIE AGHAMA MICHAEL',
  '9030298900',
  '2, Eribo str, off Okabere rd',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_52;

-- Plot: 56
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '56',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_52;

-- Allocation for OWEGIE AGHAMA MICHAEL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_52,
  plot_id_52,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-07-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_52;

UPDATE plots SET status = 'sold', customer_id = customer_id_52 WHERE id = plot_id_52;

-- Payment: ₦2,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_52,
  allocation_id_52,
  2400000,
  '2025-07-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: 55
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  '55',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_53;

-- Allocation for OWEGIE AGHAMA MICHAEL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_52,
  plot_id_53,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-07-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_53;

UPDATE plots SET status = 'sold', customer_id = customer_id_52 WHERE id = plot_id_53;

-- Payment: ₦2,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_52,
  allocation_id_53,
  2400000,
  '2025-07-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for DANIEL IJENEKHUEMEN: 8000001551

-- Customer: DANIEL IJENEKHUEMEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'DANIEL IJENEKHUEMEN',
  '8000001551',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_54;

-- Plot: TEMP-1000
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'TEMP-1000',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_54;

-- Allocation for DANIEL IJENEKHUEMEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_54,
  plot_id_54,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-11-27T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_54;

UPDATE plots SET status = 'sold', customer_id = customer_id_54 WHERE id = plot_id_54;

-- Payment: ₦5,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_54,
  allocation_id_54,
  5000000,
  '2025-11-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦10,000,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_54,
  '12_months',
  15000000,
  '2025-11-27T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);
-- Generated fake phone for CHARLES ITAMA: 8000001113

-- Customer: CHARLES ITAMA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CHARLES ITAMA',
  '8000001113',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_55;

-- Plot: TEMP-1001
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'TEMP-1001',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_55;

-- Allocation for CHARLES ITAMA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_55,
  plot_id_55,
  '67e8f05f-ae2e-47f4-8246-51168399632e',
  'approved',
  '2025-12-17T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_55;

UPDATE plots SET status = 'sold', customer_id = customer_id_55 WHERE id = plot_id_55;

-- Payment: ₦1,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_55,
  allocation_id_55,
  1500000,
  '2025-12-17T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- ========================================
-- Success Palace Estate
-- ========================================
-- Generated fake phone for EDORO EMMANUEL: 8000001209

-- Customer: EDORO EMMANUEL
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EDORO EMMANUEL',
  '8000001209',
  'EGBA JUNCTION BENIN',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_0;

-- Plot: TEMP-1000
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'TEMP-1000',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_0;

-- Allocation for EDORO EMMANUEL
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  plot_id_0,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2024-12-11T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_0;

UPDATE plots SET status = 'sold', customer_id = customer_id_0 WHERE id = plot_id_0;

-- Payment: ₦700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_0,
  allocation_id_0,
  700000,
  '2024-12-11T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for WISDOM ITEDJERE ONORIODE: 8000001931

-- Customer: WISDOM ITEDJERE ONORIODE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'WISDOM ITEDJERE ONORIODE',
  '8000001931',
  'OGBESON QUARTERS',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_1;

-- Plot: TEMP-1001
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'TEMP-1001',
  '100/200',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for WISDOM ITEDJERE ONORIODE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  plot_id_1,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2024-12-11T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_1 WHERE id = plot_id_1;

-- Payment: ₦1,400,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  allocation_id_1,
  1400000,
  '2024-12-11T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: WISDOM OHENHEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'WISDOM OHENHEN',
  '9150780135',
  '9B, ENOGIE STRT, B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_4;

-- Plot: TEMP-1002
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'TEMP-1002',
  '100/150',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_4;

-- Allocation for WISDOM OHENHEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  plot_id_4,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2025-01-27T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_4;

UPDATE plots SET status = 'sold', customer_id = customer_id_4 WHERE id = plot_id_4;

-- Payment: ₦2,025,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_4,
  allocation_id_4,
  2025000,
  '2025-01-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: WINNER OBASEKI
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'WINNER OBASEKI',
  '7025455678',
  'OSSIOMO STAFF QRTS',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: TEMP-1003
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'TEMP-1003',
  '100/150',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for WINNER OBASEKI
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2025-01-27T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦2,025,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  2025000,
  '2025-01-27T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: KENNETH NEWTON USOH
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'KENNETH NEWTON USOH',
  '8036745292',
  'BAKERY STRT, 1ST OBE, SAPELE RD, BENIN CITY',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: TEMP-1004
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'TEMP-1004',
  '100/500',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for KENNETH NEWTON USOH
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2025-01-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦6,500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  6500000,
  '2025-01-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: JULIET CHIAMAKA EZE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'JULIET CHIAMAKA EZE',
  '7068418384',
  'Arasomwan William str,mobile str off Igue-Iheya',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_7;

-- Plot: 30A
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  '30A',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for JULIET CHIAMAKA EZE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2025-02-28T23:00:00.000Z',
  'Half plot',
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦700,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  700000,
  '2025-02-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IHAZA LOUIS  OSELENE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IHAZA LOUIS  OSELENE',
  '7078388028',
  'No 25, UIDC Street off Refinery Road, Effurun, Delta State.  ',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_8;

-- Plot: 15
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  '15',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_8;

-- Allocation for IHAZA LOUIS  OSELENE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_8,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2025-04-16T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_8;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_8;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_8,
  1800000,
  '2025-04-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: IHAZA NORMAN STEPHEN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IHAZA NORMAN STEPHEN',
  '447438224096',
  'No 25, UIDC Street off Refinery Road, Effurun, Delta State.  ',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_9;

-- Plot: 10
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  '10',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_9;

-- Allocation for IHAZA NORMAN STEPHEN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  plot_id_9,
  '39742196-8966-4c24-9c3c-65bc5e65b291',
  'approved',
  '2025-04-16T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_9;

UPDATE plots SET status = 'sold', customer_id = customer_id_9 WHERE id = plot_id_9;

-- Payment: ₦1,800,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_9,
  allocation_id_9,
  1800000,
  '2025-04-16T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- ========================================
-- The Wealthy Place Estate
-- ========================================

-- Customer: JULIE CHUKWUKERE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'JULIE CHUKWUKERE',
  '8135733044',
  'Uyimwen str, 2nd utagban rd, upper ekewan',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_1;

-- Plot: TEMP-1000
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1000',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_1;

-- Allocation for JULIE CHUKWUKERE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  plot_id_1,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-18T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_1;

UPDATE plots SET status = 'sold', customer_id = customer_id_1 WHERE id = plot_id_1;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_1,
  allocation_id_1,
  500000,
  '2025-12-18T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: NEKPEN OSEH
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NEKPEN OSEH',
  '8063023129',
  '19, Iwegie Street, Off Forestry Road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_2;

-- Plot: TEMP-1001
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1001',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_2;

-- Allocation for NEKPEN OSEH
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  plot_id_2,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-21T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_2;

UPDATE plots SET status = 'sold', customer_id = customer_id_2 WHERE id = plot_id_2;

-- Payment: ₦250,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_2,
  allocation_id_2,
  250000,
  '2025-12-21T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦250,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_2,
  '12_months',
  500000,
  '2025-12-21T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Customer: EHIAGUINA CYRIL EHIZOJIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'EHIAGUINA CYRIL EHIZOJIE',
  '7034593357',
  ' 12, Ogbeifun Street, PZ, Sapele road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_3;

-- Plot: TEMP-1002
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1002',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_3;

-- Allocation for EHIAGUINA CYRIL EHIZOJIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_3,
  plot_id_3,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-21T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_3;

UPDATE plots SET status = 'sold', customer_id = customer_id_3 WHERE id = plot_id_3;

-- Payment: ₦200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_3,
  allocation_id_3,
  200000,
  '2025-12-21T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦300,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_3,
  '12_months',
  500000,
  '2025-12-21T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- Plot: TEMP-1003
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1003',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_4;

-- Allocation for PATRICK CHINONYE CLAIRE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  plot_id_4,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-21T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_4;

UPDATE plots SET status = 'sold', customer_id = customer_id_11 WHERE id = plot_id_4;

-- Payment: ₦250,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_11,
  allocation_id_4,
  250000,
  '2025-12-21T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦250,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_4,
  '12_months',
  500000,
  '2025-12-21T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);
-- Generated fake phone for WISDOM BEAUTY OKEHIELEM: 8000001867

-- Customer: WISDOM BEAUTY OKEHIELEM
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'WISDOM BEAUTY OKEHIELEM',
  '8000001867',
  ' 43 Iyobosa Street, Off Second East Circular',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_5;

-- Plot: TEMP-1004
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1004',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_5;

-- Allocation for WISDOM BEAUTY OKEHIELEM
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  plot_id_5,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-22T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_5;

UPDATE plots SET status = 'sold', customer_id = customer_id_5 WHERE id = plot_id_5;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_5,
  allocation_id_5,
  1000000,
  '2025-12-22T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: SAMUEL OSAMUDIAMEN ERHABOR
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'SAMUEL OSAMUDIAMEN ERHABOR',
  '9096130070',
  '150, New Lagos Road,B/C Edo state',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_6;

-- Plot: TEMP-1005
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1005',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_6;

-- Allocation for SAMUEL OSAMUDIAMEN ERHABOR
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  plot_id_6,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-23T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_6;

UPDATE plots SET status = 'sold', customer_id = customer_id_6 WHERE id = plot_id_6;

-- Payment: ₦200,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_6,
  allocation_id_6,
  200000,
  '2025-12-23T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦300,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_6,
  '12_months',
  500000,
  '2025-12-23T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);
-- Generated fake phone for BEAUTY IGIE: 8000000997

-- Customer: BEAUTY IGIE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'BEAUTY IGIE',
  '8000000997',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_7;

-- Plot: TEMP-1006
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1006',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_7;

-- Allocation for BEAUTY IGIE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  plot_id_7,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_7;

UPDATE plots SET status = 'sold', customer_id = customer_id_7 WHERE id = plot_id_7;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_7,
  allocation_id_7,
  500000,
  '2025-12-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: CHIMA SYLVESTER MARK
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CHIMA SYLVESTER MARK',
  '8063401862',
  'Sunny Igbineweka Strt,Off Toll-gate, Lagos Road',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_8;

-- Plot: TEMP-1007
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1007',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_8;

-- Allocation for CHIMA SYLVESTER MARK
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_8,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_8;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_8;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_8,
  500000,
  '2025-12-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: TEMP-1008
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1008',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_9;

-- Allocation for MARK COLUMBUS ONYEKA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_9,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-26T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_9;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_9;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_9,
  500000,
  '2025-12-26T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Customer: THERESA OJOLULE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'THERESA OJOLULE',
  '8158449139',
  '48B, Odeh street,off ogida barrack B/C',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_10;

-- Plot: TEMP-1009
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1009',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_10;

-- Allocation for THERESA OJOLULE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  plot_id_10,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-28T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_10;

UPDATE plots SET status = 'sold', customer_id = customer_id_10 WHERE id = plot_id_10;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_10,
  allocation_id_10,
  500000,
  '2025-12-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Plot: TEMP-1010
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1010',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_11;

-- Allocation for AIGBEDE ESTHER
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  plot_id_11,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-28T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_11;

UPDATE plots SET status = 'sold', customer_id = customer_id_8 WHERE id = plot_id_11;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_8,
  allocation_id_11,
  500000,
  '2025-12-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for OKPA MOSES OKPA: 8000001279

-- Customer: OKPA MOSES OKPA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'OKPA MOSES OKPA',
  '8000001279',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_12;

-- Plot: TEMP-1011
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1011',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_12;

-- Allocation for OKPA MOSES OKPA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  plot_id_12,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-28T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_12;

UPDATE plots SET status = 'sold', customer_id = customer_id_12 WHERE id = plot_id_12;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_12,
  allocation_id_12,
  500000,
  '2025-12-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for PROMISE EMEMA: 8000001159

-- Customer: PROMISE EMEMA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'PROMISE EMEMA',
  '8000001159',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_13;

-- Plot: TEMP-1012
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1012',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_13;

-- Allocation for PROMISE EMEMA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  plot_id_13,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-28T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_13;

UPDATE plots SET status = 'sold', customer_id = customer_id_13 WHERE id = plot_id_13;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_13,
  allocation_id_13,
  1000000,
  '2025-12-28T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for MR & MRS GODWIN UDUOKHAI: 8000001853

-- Customer: MR & MRS GODWIN UDUOKHAI
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'MR & MRS GODWIN UDUOKHAI',
  '8000001853',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_14;

-- Plot: TEMP-1013
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1013',
  '100/00',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_14;

-- Allocation for MR & MRS GODWIN UDUOKHAI
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  plot_id_14,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_14;

UPDATE plots SET status = 'sold', customer_id = customer_id_14 WHERE id = plot_id_14;

-- Payment: ₦1,000,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_14,
  allocation_id_14,
  1000000,
  '2025-12-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for IRUA OSARETIN: 8000001179

-- Customer: IRUA OSARETIN
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'IRUA OSARETIN',
  '8000001179',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_15;

-- Plot: TEMP-1014
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1014',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_15;

-- Allocation for IRUA OSARETIN
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  plot_id_15,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_15;

UPDATE plots SET status = 'sold', customer_id = customer_id_15 WHERE id = plot_id_15;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_15,
  allocation_id_15,
  500000,
  '2025-12-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦500,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_15,
  '12_months',
  1000000,
  '2025-12-29T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);
-- Generated fake phone for JOAN OSAYENDE: 8000001158

-- Customer: JOAN OSAYENDE
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'JOAN OSAYENDE',
  '8000001158',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_16;

-- Plot: TEMP-1015
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1015',
  '50/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_16;

-- Allocation for JOAN OSAYENDE
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  plot_id_16,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-29T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_16;

UPDATE plots SET status = 'sold', customer_id = customer_id_16 WHERE id = plot_id_16;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_16,
  allocation_id_16,
  500000,
  '2025-12-29T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);
-- Generated fake phone for HOPE NOMASOKPA: 8000001244

-- Customer: HOPE NOMASOKPA
INSERT INTO customers (id, full_name, phone, address, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'HOPE NOMASOKPA',
  '8000001244',
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
RETURNING id INTO STRICT customer_id_17;

-- Plot: TEMP-1016
INSERT INTO plots (id, estate_id, plot_number, dimensions, status, created_at)
VALUES (
  gen_random_uuid(),
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'TEMP-1016',
  '100/100',
  'available',
  NOW()
)
ON CONFLICT (estate_id, plot_number) DO NOTHING
RETURNING id INTO STRICT plot_id_17;

-- Allocation for HOPE NOMASOKPA
INSERT INTO allocations (id, customer_id, plot_id, estate_id, status, allocation_date, notes, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  plot_id_17,
  'e942cf12-f3fd-41a5-9368-918e450f7591',
  'approved',
  '2025-12-30T23:00:00.000Z',
  NULL,
  NOW(),
  NOW()
)
RETURNING id INTO STRICT allocation_id_17;

UPDATE plots SET status = 'sold', customer_id = customer_id_17 WHERE id = plot_id_17;

-- Payment: ₦500,000
INSERT INTO payments (id, customer_id, allocation_id, amount, payment_date, status, method, transaction_ref, created_at)
VALUES (
  gen_random_uuid(),
  customer_id_17,
  allocation_id_17,
  500000,
  '2025-12-30T23:00:00.000Z',
  'verified',
  'bank_transfer',
  'LEGACY-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 7),
  NOW()
);

-- Payment Plan: Balance ₦500,000
INSERT INTO payment_plans (id, allocation_id, plan_type, total_amount, start_date, duration_months, status, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  allocation_id_17,
  '12_months',
  1000000,
  '2025-12-30T23:00:00.000Z',
  12,
  'active',
  'Legacy Payment Plan',
  NOW(),
  NOW()
);

-- ========================================
-- Update Estate Counters
-- ========================================

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = 'e942cf12-f3fd-41a5-9368-918e450f7591' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = 'e942cf12-f3fd-41a5-9368-918e450f7591' AND status = 'available')
WHERE id = 'e942cf12-f3fd-41a5-9368-918e450f7591';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe' AND status = 'available')
WHERE id = '9b98ca98-29dc-40db-bcac-d5d60d8b8dfe';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '00f2b3d3-70f7-439d-be5d-a8d49ab965d3' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '00f2b3d3-70f7-439d-be5d-a8d49ab965d3' AND status = 'available')
WHERE id = '00f2b3d3-70f7-439d-be5d-a8d49ab965d3';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '1728541b-d6f1-4880-a0d1-cdc7379ed58f' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '1728541b-d6f1-4880-a0d1-cdc7379ed58f' AND status = 'available')
WHERE id = '1728541b-d6f1-4880-a0d1-cdc7379ed58f';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '39742196-8966-4c24-9c3c-65bc5e65b291' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '39742196-8966-4c24-9c3c-65bc5e65b291' AND status = 'available')
WHERE id = '39742196-8966-4c24-9c3c-65bc5e65b291';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = 'b77f2bc8-cc32-4e13-83e9-88d198a17e9d' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = 'b77f2bc8-cc32-4e13-83e9-88d198a17e9d' AND status = 'available')
WHERE id = 'b77f2bc8-cc32-4e13-83e9-88d198a17e9d';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '67e8f05f-ae2e-47f4-8246-51168399632e' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '67e8f05f-ae2e-47f4-8246-51168399632e' AND status = 'available')
WHERE id = '67e8f05f-ae2e-47f4-8246-51168399632e';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '2baa338f-bcc7-4cda-ab73-2bed010209ae' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = '2baa338f-bcc7-4cda-ab73-2bed010209ae' AND status = 'available')
WHERE id = '2baa338f-bcc7-4cda-ab73-2bed010209ae';

UPDATE estates
SET 
  occupied_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = 'c03c9e69-3482-4264-adc1-38bdea528494' AND status IN ('sold', 'reserved')),
  available_plots = (SELECT COUNT(*) FROM plots WHERE estate_id = 'c03c9e69-3482-4264-adc1-38bdea528494' AND status = 'available')
WHERE id = 'c03c9e69-3482-4264-adc1-38bdea528494';

-- Re-enable triggers
ALTER TABLE plots ENABLE TRIGGER ALL;
ALTER TABLE allocations ENABLE TRIGGER ALL;
ALTER TABLE allocation_plots ENABLE TRIGGER ALL;

COMMIT;

-- Import Summary:
-- Total records processed: 231
-- Successfully imported: 220
-- Skipped: 11
-- Unique customers: 190