# api/serializers.py

import math
from rest_framework import serializers
from .models import Location, Severity, Environment, Accident, Party, Victim

class FloatFieldWithNaNHandling(serializers.FloatField):
    def to_representation(self, value):
        if value is not None and (math.isnan(value) or math.isinf(value)):
            return None  # Replace NaN or Inf with None or another value
        return super().to_representation(value)

class LocationSerializer(serializers.ModelSerializer):
    point_x = FloatFieldWithNaNHandling()
    point_y = FloatFieldWithNaNHandling()

    class Meta:
        model = Location
        fields = [
            'location_id',
            'primary_rd',
            'secondary_rd',
            'distance',
            'direction',
            'intersection',
            'city',
            'county',
            'point_x',
            'point_y',
        ]


class SeveritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Severity
        fields = [
            'severity_id',
            'collision_severity',
            'number_killed',
            'number_injured',
            'count_severe_inj',
            'count_visible_inj',
            'count_complaint_pain',
            'count_ped_killed',
            'count_ped_injured',
            'count_bicyclist_killed',
            'count_bicyclist_injured',
            'count_mc_killed',
            'count_mc_injured',
        ]


class EnvironmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Environment
        fields = [
            'environment_id',
            'weather_1',
            'weather_2',
            'road_surface',
            'road_cond_1',
            'road_cond_2',
            'lighting',
            'state_hwy_ind',
        ]


class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = [
            'party_id',
            'case',
            'party_number',
            'party_type',
            'at_fault',
            'party_sex',
            'party_age',
            'party_sobriety',
            'party_drug_physical',
            'dir_of_travel',
            'party_safety_equip_1',
            'party_safety_equip_2',
            'finan_respons',
            'vehicle_year',
            'vehicle_make',
            'stwd_vehicle_type',
            'inattention',
            'race',
            'move_pre_acc',
        ]


class VictimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Victim
        fields = [
            'victim_id',
            'case',
            'party',
            'victim_role',
            'victim_sex',
            'victim_age',
            'victim_degree_of_injury',
            'victim_seating_position',
            'victim_safety_equip_1',
            'victim_safety_equip_2',
            'victim_ejected',
        ]


class AccidentSerializer(serializers.ModelSerializer):
    location = LocationSerializer()
    severity = SeveritySerializer()
    environment = EnvironmentSerializer()

    class Meta:
        model = Accident
        fields = [
            'case_id',
            'accident_year',
            'collision_date',
            'collision_time',
            'location',
            'severity',
            'environment',
            'party_count',
            'hit_and_run',
            'type_of_collision',
            'pedestrian_accident',
            'bicycle_accident',
            'motorcycle_accident',
            'truck_accident',
            'mviw',
            'alcohol_involved',
            'day_of_week',
        ]

