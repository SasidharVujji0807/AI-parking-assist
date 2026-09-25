-- AI Parking Finder — Realistic Seed Data (India)
-- Run after 001_initial_schema.sql
-- These are demo parking locations in major Indian cities

-- ── Create a demo operator user first (sign up via app, then update role)
-- After running this seed, manually set one user's role to 'operator' in Supabase dashboard
-- or use the admin function below

-- ── Mumbai Parking Locations ────────────────────────────────────────────────
insert into public.parking_locations (
  name, description, address, city, state, postal_code,
  latitude, longitude, parking_type, vehicle_types, amenities,
  total_spaces, available_spaces, availability_status,
  price, currency, pricing_unit, rating, review_count,
  is_24_7, opening_time, closing_time, is_active
) values
(
  'Nariman Point Multi-Level Parking',
  'Modern multi-level parking facility in the heart of the business district. CCTV surveillance, 24/7 security, and EV charging stations available.',
  '100 Nariman Point, Marine Lines, Mumbai',
  'Mumbai', 'Maharashtra', '400021',
  18.9256, 72.8242,
  'garage', array['car','suv','ev'], array['ev_charging','security','cctv','covered','accessible','lighting'],
  250, 45, 'limited',
  80.00, 'INR', 'hour', 4.3, 128,
  true, null, null, true
),
(
  'Bandra Kurla Complex Parking Zone A',
  'Spacious surface lot serving the BKC financial district. Well-lit, with security guards. Monthly passes available for regular commuters.',
  'G Block, Bandra Kurla Complex, Bandra East, Mumbai',
  'Mumbai', 'Maharashtra', '400051',
  19.0728, 72.8826,
  'lot', array['car','suv','motorcycle','van'], array['security','cctv','lighting','accessible'],
  400, 120, 'available',
  60.00, 'INR', 'hour', 4.1, 89,
  false, '06:00', '22:00', true
),
(
  'Andheri Station Parking',
  'Conveniently located near Andheri railway station. Ideal for commuters. Basic facilities but very affordable.',
  'Station Road, Andheri West, Mumbai',
  'Mumbai', 'Maharashtra', '400058',
  19.1136, 72.8697,
  'lot', array['car','motorcycle','suv'], array['security','lighting'],
  150, 0, 'full',
  30.00, 'INR', 'hour', 3.5, 210,
  false, '05:00', '23:00', true
),
(
  'Phoenix Mills Smart Parking',
  'Premium smart parking facility at Phoenix Mills Mall. Automated guidance system, valet option available, and EV charging.',
  'LBS Marg, Lower Parel, Mumbai',
  'Mumbai', 'Maharashtra', '400013',
  18.9944, 72.8295,
  'mall', array['car','suv','ev','van'], array['ev_charging','security','cctv','covered','accessible','valet','lighting','restroom'],
  600, 200, 'available',
  100.00, 'INR', 'hour', 4.6, 345,
  false, '08:00', '23:00', true
),
(
  'Powai Hiranandani Parking',
  'Covered multi-level parking within the Hiranandani complex. Reserved monthly spots available. Clean and well-maintained.',
  'Hiranandani Gardens, Powai, Mumbai',
  'Mumbai', 'Maharashtra', '400076',
  19.1176, 72.9060,
  'garage', array['car','suv','motorcycle'], array['covered','security','cctv','lighting'],
  300, 80, 'limited',
  50.00, 'INR', 'hour', 4.0, 67,
  true, null, null, true
),

-- ── Bengaluru Parking Locations ────────────────────────────────────────────
(
  'Koramangala Parking Hub',
  'Modern parking complex serving the Koramangala startup zone. Multiple entry/exit points, app-based payment system.',
  '80 Feet Road, 4th Block, Koramangala, Bengaluru',
  'Bengaluru', 'Karnataka', '560034',
  12.9352, 77.6245,
  'garage', array['car','suv','motorcycle','ev'], array['ev_charging','security','cctv','covered','lighting'],
  200, 65, 'available',
  40.00, 'INR', 'hour', 4.4, 156,
  true, null, null, true
),
(
  'MG Road Metro Parking',
  'Official metro-affiliated parking near MG Road station. Integrated ticketing, disabled access, and 24/7 operation.',
  '45 MG Road, Brigade Road Junction, Bengaluru',
  'Bengaluru', 'Karnataka', '560001',
  12.9716, 77.6099,
  'public', array['car','suv','motorcycle'], array['security','accessible','lighting','cctv'],
  180, 30, 'limited',
  25.00, 'INR', 'hour', 3.8, 203,
  true, null, null, true
),
(
  'Forum Mall Parking Whitefield',
  'Forum Mall dedicated parking. Free for first 2 hours with mall purchase validation. EV bays available.',
  'ITPL Main Road, Whitefield, Bengaluru',
  'Bengaluru', 'Karnataka', '560066',
  12.9833, 77.7400,
  'mall', array['car','suv','ev'], array['ev_charging','security','cctv','covered','accessible','restroom','lighting'],
  500, 280, 'available',
  30.00, 'INR', 'hour', 4.5, 412,
  false, '09:00', '22:00', true
),
(
  'Indiranagar 100 Feet Road Parking',
  'Street-level parking along 100 Feet Road. Managed by BBMP. Suitable for short stays and restaurant visits.',
  '100 Feet Road, Indiranagar, Bengaluru',
  'Bengaluru', 'Karnataka', '560038',
  12.9784, 77.6408,
  'street', array['car','motorcycle','suv'], array['lighting'],
  80, 20, 'limited',
  20.00, 'INR', 'hour', 3.2, 78,
  false, '08:00', '22:00', true
),

-- ── Delhi NCR Parking Locations ────────────────────────────────────────────
(
  'Connaught Place Basement Parking',
  'Underground parking at the heart of New Delhi. Very central, walking distance to all CP shops and restaurants.',
  'Connaught Place, New Delhi',
  'New Delhi', 'Delhi', '110001',
  28.6315, 77.2167,
  'garage', array['car','suv','motorcycle'], array['security','cctv','covered','accessible','lighting'],
  350, 100, 'available',
  50.00, 'INR', 'hour', 4.0, 289,
  true, null, null, true
),
(
  'Cyber City Gurugram Smart Park',
  'State-of-the-art automated parking at DLF Cyber City. Sensor-based availability display, EV fast-chargers.',
  'DLF Cyber City, Phase II, Gurugram',
  'Gurugram', 'Haryana', '122002',
  28.4949, 77.0884,
  'garage', array['car','suv','ev','van'], array['ev_charging','security','cctv','covered','accessible','lighting','restroom'],
  600, 150, 'available',
  70.00, 'INR', 'hour', 4.7, 534,
  false, '06:00', '23:00', true
),
(
  'Saket Metro Parking',
  'Adjacent to Saket Metro station. Affordable long-term rates, ideal for metro commuters parking all day.',
  'Saket Metro Station, New Delhi',
  'New Delhi', 'Delhi', '110017',
  28.5244, 77.2066,
  'public', array['car','motorcycle','suv'], array['security','lighting'],
  200, 50, 'limited',
  20.00, 'INR', 'hour', 3.6, 167,
  false, '05:00', '23:30', true
),
(
  'Lajpat Nagar Market Parking',
  'Convenient parking for Lajpat Nagar central market visitors. Can get crowded on weekends.',
  'Central Market, Lajpat Nagar, New Delhi',
  'New Delhi', 'Delhi', '110024',
  28.5700, 77.2434,
  'lot', array['car','motorcycle','suv','van'], array['security'],
  120, 0, 'full',
  30.00, 'INR', 'hour', 3.3, 445,
  false, '09:00', '21:00', true
),

-- ── Chennai Parking ────────────────────────────────────────────────────────
(
  'T Nagar Pondy Bazaar Parking Complex',
  'Multi-story parking serving the busy T Nagar shopping district. Frequently full during weekends and festivals.',
  'Pondy Bazaar, T Nagar, Chennai',
  'Chennai', 'Tamil Nadu', '600017',
  13.0418, 80.2341,
  'garage', array['car','motorcycle','suv'], array['security','cctv','covered','lighting'],
  300, 0, 'full',
  40.00, 'INR', 'hour', 3.7, 298,
  false, '08:00', '22:00', true
),
(
  'Express Avenue Mall Parking',
  'Premium parking at Express Avenue Mall. Automated token system, valet parking, EV charging.',
  'White''s Road, Royapettah, Chennai',
  'Chennai', 'Tamil Nadu', '600014',
  13.0567, 80.2677,
  'mall', array['car','suv','ev'], array['ev_charging','security','cctv','covered','accessible','valet','restroom'],
  450, 180, 'available',
  60.00, 'INR', 'hour', 4.5, 376,
  false, '09:00', '22:30', true
),
(
  'Adyar Signal Public Parking',
  'CMDA managed public parking near Adyar junction. Basic but affordable, suitable for nearby office workers.',
  'LB Road, Adyar, Chennai',
  'Chennai', 'Tamil Nadu', '600020',
  13.0048, 80.2565,
  'public', array['car','motorcycle','suv'], array['lighting'],
  100, 35, 'limited',
  15.00, 'INR', 'hour', 3.0, 89,
  false, '06:00', '22:00', true
),

-- ── Hyderabad Parking ──────────────────────────────────────────────────────
(
  'HITEC City Parking Hub',
  'Large modern parking complex serving the IT hub of Hyderabad. 24/7 operation with security.',
  'Cyber Towers, HITEC City, Hyderabad',
  'Hyderabad', 'Telangana', '500081',
  17.4435, 78.3772,
  'garage', array['car','suv','ev','motorcycle'], array['ev_charging','security','cctv','covered','lighting','accessible'],
  500, 120, 'available',
  45.00, 'INR', 'hour', 4.2, 267,
  true, null, null, true
),
(
  'GVK One Mall Parking Banjara Hills',
  'Premium mall parking with covered access to GVK One Mall. Valet service and EV charging available.',
  'Road No. 1, Banjara Hills, Hyderabad',
  'Hyderabad', 'Telangana', '500034',
  17.4204, 78.4488,
  'mall', array['car','suv','ev','van'], array['ev_charging','security','cctv','covered','accessible','valet','restroom','lighting'],
  350, 90, 'available',
  55.00, 'INR', 'hour', 4.6, 312,
  false, '09:00', '22:00', true
),
(
  'Charminar Heritage Parking',
  'Managed parking near the iconic Charminar monument. Busy tourist area, advance booking recommended on weekends.',
  'Charminar Road, Hyderabad',
  'Hyderabad', 'Telangana', '500002',
  17.3616, 78.4747,
  'lot', array['car','motorcycle','suv','van'], array['security'],
  150, 40, 'limited',
  25.00, 'INR', 'hour', 3.4, 189,
  false, '07:00', '22:00', true
),

-- ── Pune Parking ───────────────────────────────────────────────────────────
(
  'Koregaon Park Parking Plaza',
  'Upscale parking near Koregaon Park restaurants and hotels. Covered, secure, and EV-friendly.',
  'North Main Road, Koregaon Park, Pune',
  'Pune', 'Maharashtra', '411001',
  18.5362, 73.8940,
  'garage', array['car','suv','ev','motorcycle'], array['ev_charging','security','cctv','covered','lighting','accessible'],
  180, 60, 'available',
  50.00, 'INR', 'hour', 4.3, 145,
  true, null, null, true
),
(
  'Shivaji Nagar Court Road Parking',
  'Municipal parking facility near Shivaji Nagar court and government offices. Very affordable daily rates.',
  'FC Road, Shivaji Nagar, Pune',
  'Pune', 'Maharashtra', '411005',
  18.5314, 73.8446,
  'public', array['car','motorcycle','suv'], array['security','lighting'],
  100, 25, 'limited',
  10.00, 'INR', 'hour', 3.1, 78,
  false, '07:00', '21:00', true
);
