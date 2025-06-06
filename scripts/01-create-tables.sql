-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create towns table
CREATE TABLE IF NOT EXISTS towns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  province_id UUID REFERENCES provinces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, province_id)
);

-- Create vans table
CREATE TABLE IF NOT EXISTS vans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  town_id UUID REFERENCES towns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_types table
CREATE TABLE IF NOT EXISTS service_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  duration INTEGER NOT NULL, -- duration in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  van_id UUID REFERENCES vans(id) ON DELETE CASCADE,
  service_type_id UUID REFERENCES service_types(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  patient_details JSONB NOT NULL,
  special_requirements TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(van_id, appointment_date, appointment_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_towns_province_id ON towns(province_id);
CREATE INDEX IF NOT EXISTS idx_vans_town_id ON vans(town_id);
CREATE INDEX IF NOT EXISTS idx_appointments_van_date ON appointments(van_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
