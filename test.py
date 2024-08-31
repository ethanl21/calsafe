import psycopg2

# Database connection parameters
dbname = "calsafe"
user = "postgres"
password = "Fullerton"
host = "localhost"

# SQL query to fetch data
query = "SELECT * FROM accidents LIMIT 10;"

# Connect to the database
try:
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
    cursor = conn.cursor()
    
    # Execute the query
    cursor.execute(query)
    
    # Fetch all rows from the table
    rows = cursor.fetchall()
    
    # Print each row
    for row in rows:
        print(row)
    
    # Close the cursor and the connection
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"An error occurred: {e}")
