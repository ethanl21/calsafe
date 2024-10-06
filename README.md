How to Setup Development Server for CalSafe:

You will need to Install:
  -PostgreSQL with GIS tools
  -Python
  -OS4Geo4W (For GDAL)
  -Everything in "requirements.txt"
  -Node.js

Make a note of paths in /calsafe/calsafe/settings.py!
  -Set your "GDAL_LIBRARY_PATH =" to where you installed "gdal309.dll" within your OS4Geo4W path

Make a note of the database username and password!
  -Name: "calsafe"
  -User: "postgres"
  -Password: "Fullerton"

Initial Setup of Database:
  -I'm using pgAdmin to manage the database, I suggest you use it.
  -SQL table is provided to populate the database

Running the Website:
Django is configured to run on localhost:8000/
  -To start Django, run the file "manage.py"
Next.js is configured to run on localhost:3000/
  -To start Next.js, run "npm run dev" on the console


