from django.db import models

class Location(models.Model):
    location_id = models.AutoField(primary_key=True)
    primary_rd = models.CharField(max_length=50, null=True)
    secondary_rd = models.CharField(max_length=50, null=True)
    distance = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    direction = models.CharField(max_length=1, null=True)
    intersection = models.CharField(max_length=1, null=True)
    city = models.CharField(max_length=30, null=True)
    county = models.CharField(max_length=30, null=True)
    point_x = models.FloatField(null=True)
    point_y = models.FloatField(null=True)

    class Meta:
        db_table = 'location'
        managed = False

class Severity(models.Model):
    severity_id = models.AutoField(primary_key=True)
    collision_severity = models.CharField(max_length=1, null=True)
    number_killed = models.IntegerField(null=True)
    number_injured = models.IntegerField(null=True)
    count_severe_inj = models.IntegerField(null=True)
    count_visible_inj = models.IntegerField(null=True)
    count_complaint_pain = models.IntegerField(null=True)
    count_ped_killed = models.IntegerField(null=True)
    count_ped_injured = models.IntegerField(null=True)
    count_bicyclist_killed = models.IntegerField(null=True)
    count_bicyclist_injured = models.IntegerField(null=True)
    count_mc_killed = models.IntegerField(null=True)
    count_mc_injured = models.IntegerField(null=True)

    class Meta:
        db_table = 'severity'
        managed = False

class Environment(models.Model):
    environment_id = models.AutoField(primary_key=True)
    weather_1 = models.CharField(max_length=1, null=True)
    weather_2 = models.CharField(max_length=1, null=True)
    road_surface = models.CharField(max_length=1, null=True)
    road_cond_1 = models.CharField(max_length=1, null=True)
    road_cond_2 = models.CharField(max_length=1, null=True)
    lighting = models.CharField(max_length=1, null=True)
    state_hwy_ind = models.CharField(max_length=1, null=True)

    class Meta:
        db_table = 'environment'
        managed = False

class Accident(models.Model):
    case_id = models.AutoField(primary_key=True)
    accident_year = models.IntegerField()
    collision_date = models.DateField()
    collision_time = models.TimeField(null=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, db_column='location_id')
    severity = models.ForeignKey(Severity, on_delete=models.CASCADE, db_column='severity_id')
    environment = models.ForeignKey(Environment, on_delete=models.CASCADE, db_column='environment_id')
    party_count = models.IntegerField()
    hit_and_run = models.CharField(max_length=1, null=True)
    type_of_collision = models.CharField(max_length=1, null=True)
    pedestrian_accident = models.CharField(max_length=1, null=True)
    bicycle_accident = models.CharField(max_length=1, null=True)
    motorcycle_accident = models.CharField(max_length=1, null=True)
    truck_accident = models.CharField(max_length=1, null=True)
    mviw = models.CharField(max_length=1, null=True)
    alcohol_involved = models.CharField(max_length=1, null=True)
    pcf_viol_category = models.CharField(max_length=2, null=True)
    day_of_week = models.CharField(max_length=1, null=True)

    class Meta:
        db_table = 'accidents'
        managed = False

class Party(models.Model):
    party_id = models.AutoField(primary_key=True)
    case = models.ForeignKey(Accident, on_delete=models.CASCADE, db_column='case_id')
    party_number = models.IntegerField()
    party_type = models.CharField(max_length=1, null=True)
    at_fault = models.CharField(max_length=1, null=True)
    party_sex = models.CharField(max_length=1, null=True)
    party_age = models.IntegerField(null=True)
    party_sobriety = models.CharField(max_length=1, null=True)
    party_drug_physical = models.CharField(max_length=1, null=True)
    dir_of_travel = models.CharField(max_length=1, null=True)
    party_safety_equip_1 = models.CharField(max_length=1, null=True)
    party_safety_equip_2 = models.CharField(max_length=1, null=True)
    finan_respons = models.CharField(max_length=1, null=True)
    vehicle_year = models.IntegerField(null=True)
    vehicle_make = models.CharField(max_length=50, null=True)
    stwd_vehicle_type = models.CharField(max_length=1, null=True)
    inattention = models.CharField(max_length=1, null=True)
    race = models.CharField(max_length=1, null=True)
    move_pre_acc = models.CharField(max_length=1, null=True)

    class Meta:
        db_table = 'parties'
        managed = False

class Victim(models.Model):
    victim_id = models.AutoField(primary_key=True)
    case = models.ForeignKey(Accident, on_delete=models.CASCADE, db_column='case_id')
    party = models.ForeignKey(Party, on_delete=models.CASCADE, db_column='party_id')
    victim_role = models.CharField(max_length=1, null=True)
    victim_sex = models.CharField(max_length=1, null=True)
    victim_age = models.IntegerField(null=True)
    victim_degree_of_injury = models.CharField(max_length=1, null=True)
    victim_seating_position = models.CharField(max_length=1, null=True)
    victim_safety_equip_1 = models.CharField(max_length=1, null=True)
    victim_safety_equip_2 = models.CharField(max_length=1, null=True)
    victim_ejected = models.CharField(max_length=1, null=True)

    class Meta:
        db_table = 'victims'
        managed = False
