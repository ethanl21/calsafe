import os
import pandas as pd
import psycopg2

# Function to convert integer time to HH:MM:SS format
def convert_to_time_str(time_int):
    # Ensure time_int is a 4-digit number
    time_str = f"{time_int:04d}"
    # Convert to HH:MM format
    return f"{time_str[:2]}:{time_str[2:]}:00"

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

        # Insert data into Location table
        cursor.execute(
            """
            INSERT INTO Location (PRIMARY_RD, SECONDARY_RD, DISTANCE, DIRECTION, INTERSECTION, LATITUDE, LONGITUDE, CITY, COUNTY, POINT_X, POINT_Y)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING LOCATION_ID
            """,
            (row['PRIMARY_RD'], row['SECONDARY_RD'], row['DISTANCE'], row['DIRECTION'], row['INTERSECTION'], 
             row['LATITUDE'], row['LONGITUDE'], row['CITY'], row['COUNTY'], row['POINT_X'], row['POINT_Y'])
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
            (row['COLLISION_SEVERITY'], row['NUMBER_KILLED'], row['NUMBER_INJURED'], row['COUNT_SEVERE_INJ'], row['COUNT_VISIBLE_INJ'], 
             row['COUNT_COMPLAINT_PAIN'], row['COUNT_PED_KILLED'], row['COUNT_PED_INJURED'], row['COUNT_BICYCLIST_KILLED'], 
             row['COUNT_BICYCLIST_INJURED'], row['COUNT_MC_KILLED'], row['COUNT_MC_INJURED'])
        )
        severity_id = cursor.fetchone()[0]

        # Insert data into Environment table
        cursor.execute(
            """
            INSERT INTO Environment (WEATHER_1, WEATHER_2, ROAD_SURFACE, ROAD_COND_1, ROAD_COND_2, LIGHTING, STATE_HWY_IND)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING ENVIRONMENT_ID
            """,
            (row['WEATHER_1'], row['WEATHER_2'], row['ROAD_SURFACE'], row['ROAD_COND_1'], row['ROAD_COND_2'], row['LIGHTING'], row['STATE_HWY_IND'])
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
            (row['ACCIDENT_YEAR'], row['COLLISION_DATE'], row['COLLISION_TIME'], location_id, severity_id, environment_id, row['PARTY_COUNT'], 
             row['HIT_AND_RUN'], row['TYPE_OF_COLLISION'], row['PEDESTRIAN_ACCIDENT'], row['BICYCLE_ACCIDENT'], row['MOTORCYCLE_ACCIDENT'], 
             row['TRUCK_ACCIDENT'], row['MVIW'], row['ALCOHOL_INVOLVED'], row['PCF_VIOL_CATEGORY'], row['DAY_OF_WEEK'])
        )
        case_id = cursor.fetchone()[0]

    # Process Parties data
    for index, row in parties_df.iterrows():
        cursor.execute(
            """
            INSERT INTO Parties (CASE_ID, PARTY_NUMBER, PARTY_TYPE, AT_FAULT, PARTY_SEX, PARTY_AGE, PARTY_SOBRIETY, PARTY_DRUG_PHYSICAL, 
                                 DIR_OF_TRAVEL, PARTY_SAFETY_EQUIP_1, PARTY_SAFETY_EQUIP_2, FINAN_RESPONS, VEHICLE_YEAR, VEHICLE_MAKE, 
                                 STWD_VEHICLE_TYPE, CHP_VEH_TYPE_TOWING, CHP_VEH_TYPE_TOWED, RACE)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING PARTY_ID
            """,
            (row['CASE_ID'], row['PARTY_NUMBER'], row['PARTY_TYPE'], row['AT_FAULT'], row['PARTY_SEX'], row['PARTY_AGE'], row['PARTY_SOBRIETY'], 
             row['PARTY_DRUG_PHYSICAL'], row['DIR_OF_TRAVEL'], row['PARTY_SAFETY_EQUIP_1'], row['PARTY_SAFETY_EQUIP_2'], row['FINAN_RESPONS'], 
             row['VEHICLE_YEAR'], row['VEHICLE_MAKE'], row['STWD_VEHICLE_TYPE'], row['CHP_VEH_TYPE_TOWING'], row['CHP_VEH_TYPE_TOWED'], row['RACE'])
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
            (row['CASE_ID'], row['PARTY_ID'], row['VICTIM_ROLE'], row['VICTIM_SEX'], row['VICTIM_AGE'], row['VICTIM_DEGREE_OF_INJURY'], 
             row['VICTIM_SEATING_POSITION'], row['VICTIM_SAFETY_EQUIP_1'], row['VICTIM_SAFETY_EQUIP_2'], row['VICTIM_EJECTED'])
        )

    # Commit the transaction after each county
    conn.commit()

# Close the cursor and connection
cursor.close()
conn.close()

print("Data processing complete.")
