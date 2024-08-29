import os
import pandas as pd
import psycopg2

# Function to convert integer time to HH:MM:SS format
def convert_to_time_str(time_int):
    time_str = f"{time_int:04d}"
    return f"{time_str[:2]}:{time_str[2:]}:00"

# Function to convert potentially invalid integers
def safe_int(value, column_name):
    if value == "N" or pd.isnull(value):
        return None  
    try:
        return int(value)
    except (ValueError, TypeError):
        print(f"Invalid integer value '{value}' in column '{column_name}'")
        return None 

def safe_str(value, default='N'):
    """Ensure a value is a string, converting None or NaN to a default value."""
    if pd.isnull(value):
        return default
    return str(value).strip()

# Define the list of counties
counties = ["Imperial", "Kern", "Los Angeles", "Orange", "Riverside", "San Bernardino", "San Diego", 
            "San Luis Obispo", "Santa Barbara", "Ventura"]

# Database connection
conn = psycopg2.connect(
    dbname="calsafe",
    user="postgres",
    password="h6952thgB",
    host="localhost"
)
cursor = conn.cursor()

# Base directory where county folders are stored
base_dir = "data"

for county in counties:
    print(f"Processing data for {county}...")

    # Define file paths
    parties_file = os.path.join(base_dir, county, "Parties.csv")
    crashes_file = os.path.join(base_dir, county, "Crashes.csv")
    victims_file = os.path.join(base_dir, county, "Victims.csv")

    # Load the CSV files into DataFrames
    parties_df = pd.read_csv(parties_file)
    crashes_df = pd.read_csv(crashes_file)
    victims_df = pd.read_csv(victims_file)

    # Process Crashes data
    for index, row in crashes_df.iterrows():
        # Convert collision_time to HH:MM:SS format
        collision_time_str = convert_to_time_str(row['COLLISION_TIME'])
        if collision_time_str == "25:00:00":
            collision_time_str = None

        # Insert data into Location table
        cursor.execute(
            """
            INSERT INTO Location (PRIMARY_RD, SECONDARY_RD, DISTANCE, DIRECTION, INTERSECTION, LATITUDE, LONGITUDE, CITY, COUNTY, POINT_X, POINT_Y)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING LOCATION_ID
            """,
            (
                row['PRIMARY_RD'], 
                row['SECONDARY_RD'], 
                safe_int(row['DISTANCE'], 'DISTANCE'),
                safe_str(row['DIRECTION'])[:1],
                safe_str(row['INTERSECTION'])[:1],
                row['LATITUDE'],
                row['LONGITUDE'],
                row['CITY'],
                row['COUNTY'],
                row['POINT_X'],
                row['POINT_Y']
            )
        )
        location_id = cursor.fetchone()[0]

        # Insert data into Severity table
        cursor.execute(
            """
            INSERT INTO Severity (COLLISION_SEVERITY, NUMBER_KILLED, NUMBER_INJURED, COUNT_SEVERE_INJ, COUNT_VISIBLE_INJ, COUNT_COMPLAINT_PAIN, COUNT_PED_KILLED, COUNT_PED_INJURED, 
                                  COUNT_BICYCLIST_KILLED, COUNT_BICYCLIST_INJURED, COUNT_MC_KILLED, COUNT_MC_INJURED)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING SEVERITY_ID
            """,
            (
                row['COLLISION_SEVERITY'], 
                safe_int(row['NUMBER_KILLED'], 'NUMBER_KILLED'),  
                safe_int(row['NUMBER_INJURED'], 'NUMBER_INJURED'),  
                safe_int(row['COUNT_SEVERE_INJ'], 'COUNT_SEVERE_INJ'),  
                safe_int(row['COUNT_VISIBLE_INJ'], 'COUNT_VISIBLE_INJ'),  
                safe_int(row['COUNT_COMPLAINT_PAIN'], 'COUNT_COMPLAINT_PAIN'),  
                safe_int(row['COUNT_PED_KILLED'], 'COUNT_PED_KILLED'),  
                safe_int(row['COUNT_PED_INJURED'], 'COUNT_PED_INJURED'),  
                safe_int(row['COUNT_BICYCLIST_KILLED'], 'COUNT_BICYCLIST_KILLED'),  
                safe_int(row['COUNT_BICYCLIST_INJURED'], 'COUNT_BICYCLIST_INJURED'),  
                safe_int(row['COUNT_MC_KILLED'], 'COUNT_MC_KILLED'),  
                safe_int(row['COUNT_MC_INJURED'], 'COUNT_MC_INJURED') 
            )
        )
        severity_id = cursor.fetchone()[0]

        # Insert data into Environment table
        cursor.execute(
            """
            INSERT INTO Environment (WEATHER_1, WEATHER_2, ROAD_SURFACE, ROAD_COND_1, ROAD_COND_2, LIGHTING, STATE_HWY_IND)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING ENVIRONMENT_ID
            """,
            (
                row['WEATHER_1'], 
                row['WEATHER_2'], 
                row['ROAD_SURFACE'], 
                row['ROAD_COND_1'], 
                row['ROAD_COND_2'], 
                row['LIGHTING'], 
                row['STATE_HWY_IND']
            )
        )
        environment_id = cursor.fetchone()[0]

        # Insert data into Accidents table
        cursor.execute(
            """
            INSERT INTO Accidents (ACCIDENT_YEAR, COLLISION_DATE, COLLISION_TIME, LOCATION_ID, SEVERITY_ID, ENVIRONMENT_ID, PARTY_COUNT, 
                                   HIT_AND_RUN, TYPE_OF_COLLISION, PEDESTRIAN_ACCIDENT, BICYCLE_ACCIDENT, MOTORCYCLE_ACCIDENT, TRUCK_ACCIDENT, 
                                   MVIW, ALCOHOL_INVOLVED, PCF_VIOL_CATEGORY, DAY_OF_WEEK)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING CASE_ID
            """,
            (
                safe_int(row['ACCIDENT_YEAR'], 'ACCIDENT_YEAR'),
                row['COLLISION_DATE'], 
                collision_time_str, 
                location_id, 
                severity_id, 
                environment_id, 
                safe_int(row['PARTY_COUNT'], 'PARTY_COUNT'),
                safe_str(row['HIT_AND_RUN'])[:1],
                safe_str(row['TYPE_OF_COLLISION'])[:1],
                safe_str(row['PEDESTRIAN_ACCIDENT'])[:1],
                safe_str(row['BICYCLE_ACCIDENT'])[:1],
                safe_str(row['MOTORCYCLE_ACCIDENT'])[:1],
                safe_str(row['TRUCK_ACCIDENT'])[:1],
                safe_str(row['MVIW'])[:1],
                safe_str(row['ALCOHOL_INVOLVED'])[:1],
                safe_str(row['PCF_VIOL_CATEGORY'])[:2],
                safe_str(row['DAY_OF_WEEK'])[:1]
            )
        )
        case_id = cursor.fetchone()[0]

    # Process Parties data
    for index, row in parties_df.iterrows():
        cursor.execute(
            """
            INSERT INTO Parties (CASE_ID, PARTY_NUMBER, PARTY_TYPE, AT_FAULT, PARTY_SEX, PARTY_AGE, PARTY_SOBRIETY, PARTY_DRUG_PHYSICAL, 
                                 DIR_OF_TRAVEL, PARTY_SAFETY_EQUIP_1, PARTY_SAFETY_EQUIP_2, FINAN_RESPONS, VEHICLE_YEAR, VEHICLE_MAKE, 
                                 STWD_VEHICLE_TYPE, INATTENTION, RACE, MOVE_PRE_ACC)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING PARTY_ID
            """,
            (
                case_id, 
                safe_int(row['PARTY_NUMBER'], 'PARTY_NUMBER'),
                safe_str(row['PARTY_TYPE']), 
                safe_str(row['AT_FAULT']), 
                safe_str(row['PARTY_SEX']), 
                safe_int(row['PARTY_AGE'], 'PARTY_AGE'),
                safe_str(row['PARTY_SOBRIETY']), 
                safe_str(row['PARTY_DRUG_PHYSICAL']), 
                safe_str(row['DIR_OF_TRAVEL']), 
                safe_str(row['PARTY_SAFETY_EQUIP_1']), 
                safe_str(row['PARTY_SAFETY_EQUIP_2']), 
                safe_str(row['FINAN_RESPONS']), 
                safe_int(row['VEHICLE_YEAR'], 'VEHICLE_YEAR'),
                safe_str(row['VEHICLE_MAKE']), 
                safe_str(row['STWD_VEHICLE_TYPE']),
                safe_str(row['INATTENTION']), 
                safe_str(row['RACE']),
                safe_str(row['MOVE_PRE_ACC'])
            )
        )
        party_id = cursor.fetchone()[0]

    # Process Victims data
    for index, row in victims_df.iterrows():
        cursor.execute(
            """
            INSERT INTO Victims (CASE_ID, PARTY_ID, VICTIM_ROLE, VICTIM_SEX, VICTIM_AGE, VICTIM_DEGREE_OF_INJURY, VICTIM_SEATING_POSITION, 
                                 VICTIM_SAFETY_EQUIP_1, VICTIM_SAFETY_EQUIP_2, VICTIM_EJECTED)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                case_id, 
                party_id, 
                row['VICTIM_ROLE'], 
                row['VICTIM_SEX'], 
                safe_int(row['VICTIM_AGE'], 'VICTIM_AGE'),
                row['VICTIM_DEGREE_OF_INJURY'], 
                row['VICTIM_SEATING_POSITION'], 
                row['VICTIM_SAFETY_EQUIP_1'], 
                row['VICTIM_SAFETY_EQUIP_2'], 
                row['VICTIM_EJECTED']
            )
        )

    # Commit the transaction after processing each county
    conn.commit()

# Close the cursor and connection
cursor.close()
conn.close()

print("Data processing complete.")

