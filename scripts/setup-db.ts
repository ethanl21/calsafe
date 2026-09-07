import { db } from "../lib/db";

// Normalized 6-table schema. Columns the frontend never reads
// (location.distance/direction/intersection, severity *_ped/_bicyclist/_mc
// breakdowns, environment.weather_2/road_cond_2, accidents.mviw/
// pcf_viol_category/party_count, parties.party_safety_equip_2/dir_of_travel,
// victims.party_id) are omitted on purpose — re-add if a view needs them.
const setupSQL = `
DROP TABLE IF EXISTS victims;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS accidents;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS severity;
DROP TABLE IF EXISTS environment;

CREATE TABLE location (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_rd TEXT,
    secondary_rd TEXT,
    city TEXT,
    county TEXT,
    point_x REAL,
    point_y REAL
);

CREATE TABLE severity (
    severity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    collision_severity TEXT,
    number_killed INTEGER,
    number_injured INTEGER,
    count_severe_inj INTEGER,
    count_visible_inj INTEGER,
    count_complaint_pain INTEGER
);

CREATE TABLE environment (
    environment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    weather_1 TEXT,
    road_surface TEXT,
    road_cond_1 TEXT,
    lighting TEXT,
    state_hwy_ind TEXT
);

CREATE TABLE accidents (
    case_id INTEGER PRIMARY KEY,
    accident_year INTEGER,
    collision_date TEXT,
    collision_time TEXT,
    location_id INTEGER REFERENCES location(location_id),
    severity_id INTEGER REFERENCES severity(severity_id),
    environment_id INTEGER REFERENCES environment(environment_id),
    hit_and_run TEXT,
    type_of_collision TEXT,
    pedestrian_accident TEXT,
    bicycle_accident TEXT,
    motorcycle_accident TEXT,
    truck_accident TEXT,
    alcohol_involved TEXT,
    day_of_week TEXT
);

CREATE TABLE parties (
    party_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER REFERENCES accidents(case_id),
    party_number INTEGER,
    party_type TEXT,
    at_fault TEXT,
    party_sex TEXT,
    party_age INTEGER,
    party_sobriety TEXT,
    party_drug_physical TEXT,
    party_safety_equip_1 TEXT,
    finan_respons TEXT,
    vehicle_year INTEGER,
    vehicle_make TEXT,
    stwd_vehicle_type TEXT,
    inattention TEXT,
    race TEXT,
    move_pre_acc TEXT
);

CREATE TABLE victims (
    victim_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER REFERENCES accidents(case_id),
    victim_role TEXT,
    victim_sex TEXT,
    victim_age INTEGER,
    victim_degree_of_injury TEXT,
    victim_seating_position TEXT,
    victim_safety_equip_1 TEXT,
    victim_ejected TEXT
);

-- indexes for the read-heavy API (created on empty tables, so cheap)
CREATE INDEX IF NOT EXISTS idx_parties_case ON parties(case_id);
CREATE INDEX IF NOT EXISTS idx_victims_case ON victims(case_id);
CREATE INDEX IF NOT EXISTS idx_location_county_city ON location(county, city);
CREATE INDEX IF NOT EXISTS idx_accidents_date ON accidents(collision_date);
CREATE INDEX IF NOT EXISTS idx_accidents_year ON accidents(accident_year);
CREATE INDEX IF NOT EXISTS idx_accidents_location ON accidents(location_id);
CREATE INDEX IF NOT EXISTS idx_accidents_severity ON accidents(severity_id);
CREATE INDEX IF NOT EXISTS idx_accidents_environment ON accidents(environment_id);
`;

async function setup() {
	console.log("Creating tables...");
	// libsql has no multi-statement execute: split and run one by one.
	for (const stmt of setupSQL
		.split(";")
		.map((s) => s.trim())
		.filter(Boolean)) {
		await db.execute(stmt);
	}
	console.log("Tables created successfully.");
	db.close();
}

setup().catch((err) => {
	console.error("Setup failed:", err);
	process.exit(1);
});
