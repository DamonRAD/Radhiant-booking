-- Insert South African provinces
INSERT INTO provinces (name) VALUES
  ('Eastern Cape'),
  ('Free State'),
  ('Gauteng'),
  ('KwaZulu-Natal'),
  ('Limpopo'),
  ('Mpumalanga'),
  ('North West'),
  ('Northern Cape'),
  ('Western Cape')
ON CONFLICT (name) DO NOTHING;

-- Insert sample towns (you can expand this)
WITH province_ids AS (
  SELECT id, name FROM provinces
)
INSERT INTO towns (name, province_id) VALUES
  -- Western Cape
  ('Cape Town', (SELECT id FROM province_ids WHERE name = 'Western Cape')),
  ('Stellenbosch', (SELECT id FROM province_ids WHERE name = 'Western Cape')),
  ('Paarl', (SELECT id FROM province_ids WHERE name = 'Western Cape')),
  ('George', (SELECT id FROM province_ids WHERE name = 'Western Cape')),
  
  -- Gauteng
  ('Johannesburg', (SELECT id FROM province_ids WHERE name = 'Gauteng')),
  ('Pretoria', (SELECT id FROM province_ids WHERE name = 'Gauteng')),
  ('Sandton', (SELECT id FROM province_ids WHERE name = 'Gauteng')),
  ('Randburg', (SELECT id FROM province_ids WHERE name = 'Gauteng')),
  
  -- KwaZulu-Natal
  ('Durban', (SELECT id FROM province_ids WHERE name = 'KwaZulu-Natal')),
  ('Pietermaritzburg', (SELECT id FROM province_ids WHERE name = 'KwaZulu-Natal')),
  ('Newcastle', (SELECT id FROM province_ids WHERE name = 'KwaZulu-Natal'))
ON CONFLICT (name, province_id) DO NOTHING;

-- Insert service types
INSERT INTO service_types (name, description, duration) VALUES
  ('Mammogram', 'Specialized breast X-ray screening for early detection of breast cancer', 15),
  ('Ultrasound', 'Non-invasive imaging using sound waves to view internal structures', 30),
  ('X-Ray', 'Standard radiographic imaging for bones and organs', 10),
  ('ECG', 'Electrocardiogram to monitor heart activity', 15)
ON CONFLICT (name) DO NOTHING;

-- Insert sample vans
WITH town_ids AS (
  SELECT t.id, t.name, p.name as province_name 
  FROM towns t 
  JOIN provinces p ON t.province_id = p.id
)
INSERT INTO vans (name, location, capabilities, town_id) VALUES
  ('Radhiant Mobile Unit Alpha', 'Tygerberg Hospital Parking', ARRAY['mammogram', 'ultrasound'], 
   (SELECT id FROM town_ids WHERE name = 'Cape Town')),
  ('Radhiant Mobile Unit Beta', 'Charlotte Maxeke Hospital Parking', ARRAY['mammogram', 'ultrasound'], 
   (SELECT id FROM town_ids WHERE name = 'Johannesburg')),
  ('Radhiant Mobile Unit Gamma', 'Addington Hospital Parking', ARRAY['mammogram', 'ultrasound'], 
   (SELECT id FROM town_ids WHERE name = 'Durban')),
  ('Radhiant Mobile Unit Delta', 'Steve Biko Academic Hospital Parking', ARRAY['mammogram', 'ultrasound'], 
   (SELECT id FROM town_ids WHERE name = 'Pretoria'))
ON CONFLICT DO NOTHING;
