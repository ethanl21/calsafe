from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Location, Severity, Environment, Accident, Party, Victim
from .serializers import (LocationSerializer, SeveritySerializer, EnvironmentSerializer, 
                          AccidentSerializer, PartySerializer, VictimSerializer)
from django.db.models import Q

@api_view(['GET'])
def accident_list(request):
    queryset = Accident.objects.select_related('location', 'severity', 'environment').prefetch_related('parties', 'victims')

    # Extract filters from query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    county = request.GET.get('county')
    city = request.GET.get('city')

    # Filters for Severity Model
    collision_severity = request.GET.get('collision_severity')
    number_killed = request.GET.get('number_killed')
    number_injured = request.GET.get('number_injured')
    count_severe_inj = request.GET.get('count_severe_inj')
    count_visible_inj = request.GET.get('count_visible_inj')
    count_complaint_pain = request.GET.get('count_complaint_pain')
    count_ped_killed = request.GET.get('count_ped_killed')
    count_ped_injured = request.GET.get('count_ped_injured')
    count_bicyclist_killed = request.GET.get('count_bicyclist_killed')
    count_bicyclist_injured = request.GET.get('count_bicyclist_injured')
    count_mc_killed = request.GET.get('count_mc_killed')
    count_mc_injured = request.GET.get('count_mc_injured')

    # Filters for Accident Model
    intersection = request.GET.get('intersection')
    direction = request.GET.get('direction')
    weather_1 = request.GET.get('weather_1')
    party_count = request.GET.get('party_count')
    hit_and_run = request.GET.get('hit_and_run')
    type_of_collision = request.GET.get('type_of_collision')
    pedestrian_accident = request.GET.get('pedestrian_accident')
    bicycle_accident = request.GET.get('bicycle_accident')
    motorcycle_accident = request.GET.get('motorcycle_accident')
    truck_accident = request.GET.get('truck_accident')
    mviw = request.GET.get('mviw')
    alcohol_involved = request.GET.get('alcohol_involved')
    day_of_week = request.GET.get('day_of_week')

    # Filters for Party Model
    party_type = request.GET.get('party_type')
    at_fault = request.GET.get('at_fault')
    party_sex = request.GET.get('party_sex')
    party_age = request.GET.get('party_age')
    party_sobriety = request.GET.get('party_sobriety')
    party_drug_physical = request.GET.get('party_drug_physical')
    party_safety_equip_1 = request.GET.get('party_safety_equip_1')
    finan_respons = request.GET.get('finan_respons')
    vehicle_year = request.GET.get('vehicle_year')
    vehicle_make = request.GET.get('vehicle_make')
    stwd_vehicle_type = request.GET.get('stwd_vehicle_type')
    inattention = request.GET.get('inattention')
    race = request.GET.get('race')
    move_pre_acc = request.GET.get('move_pre_acc')

    # Filters for Victim Model
    victim_role = request.GET.get('victim_role')
    victim_sex = request.GET.get('victim_sex')
    victim_age = request.GET.get('victim_age')
    victim_degree_of_injury = request.GET.get('victim_degree_of_injury')
    victim_seating_position = request.GET.get('victim_seating_position')
    victim_safety_equip_1 = request.GET.get('victim_safety_equip_1')
    victim_ejected = request.GET.get('victim_ejected')

    # Apply date range filter
    if start_date and end_date:
        queryset = queryset.filter(collision_date__range=[start_date, end_date])
    elif start_date:
        queryset = queryset.filter(collision_date__gte=start_date)
    elif end_date:
        queryset = queryset.filter(collision_date__lte=end_date)

    # Apply location filter
    if county:
        queryset = queryset.filter(location__county__icontains=county)
    if city:
        queryset = queryset.filter(location__city__icontains=city)

    # Apply severity filters
    if collision_severity:
        queryset = queryset.filter(severity__collision_severity__icontains=collision_severity)
    if number_killed:
        queryset = queryset.filter(severity__number_killed__gte=number_killed)
    if number_injured:
        queryset = queryset.filter(severity__number_injured__gte=number_injured)
    if count_severe_inj:
        queryset = queryset.filter(severity__count_severe_inj__gte=count_severe_inj)
    if count_visible_inj:
        queryset = queryset.filter(severity__count_visible_inj__gte=count_visible_inj)
    if count_complaint_pain:
        queryset = queryset.filter(severity__count_complaint_pain__gte=count_complaint_pain)
    if count_ped_killed:
        queryset = queryset.filter(severity__count_ped_killed__gte=count_ped_killed)
    if count_ped_injured:
        queryset = queryset.filter(severity__count_ped_injured__gte=count_ped_injured)
    if count_bicyclist_killed:
        queryset = queryset.filter(severity__count_bicyclist_killed__gte=count_bicyclist_killed)
    if count_bicyclist_injured:
        queryset = queryset.filter(severity__count_bicyclist_injured__gte=count_bicyclist_injured)
    if count_mc_killed:
        queryset = queryset.filter(severity__count_mc_killed__gte=count_mc_killed)
    if count_mc_injured:
        queryset = queryset.filter(severity__count_mc_injured__gte=count_mc_injured)

    # Apply filters for Accident Model fields
    if intersection:
        queryset = queryset.filter(location__intersection__icontains=intersection)
    if direction:
        queryset = queryset.filter(location__direction__icontains=direction)
    if weather_1:
        queryset = queryset.filter(environment__weather_1__icontains=weather_1)
    if party_count:
        queryset = queryset.filter(party_count__gte=party_count)
    if hit_and_run:
        queryset = queryset.filter(hit_and_run__iexact=hit_and_run)
    if type_of_collision:
        queryset = queryset.filter(type_of_collision__icontains=type_of_collision)
    if pedestrian_accident:
        queryset = queryset.filter(pedestrian_accident__iexact=pedestrian_accident)
    if bicycle_accident:
        queryset = queryset.filter(bicycle_accident__iexact=bicycle_accident)
    if motorcycle_accident:
        queryset = queryset.filter(motorcycle_accident__iexact=motorcycle_accident)
    if truck_accident:
        queryset = queryset.filter(truck_accident__iexact=truck_accident)
    if mviw:
        queryset = queryset.filter(mviw__iexact=mviw)
    if alcohol_involved:
        queryset = queryset.filter(alcohol_involved__iexact=alcohol_involved)
    if day_of_week:
        queryset = queryset.filter(day_of_week__iexact=day_of_week)

    # Apply filters for Party Model fields
    if party_type:
        queryset = queryset.filter(parties__party_type__icontains=party_type)
    if at_fault:
        queryset = queryset.filter(parties__at_fault__iexact=at_fault)
    if party_sex:
        queryset = queryset.filter(parties__party_sex__iexact=party_sex)
    if party_age:
        queryset = queryset.filter(parties__party_age__gte=party_age)
    if party_sobriety:
        queryset = queryset.filter(parties__party_sobriety__icontains=party_sobriety)
    if party_drug_physical:
        queryset = queryset.filter(parties__party_drug_physical__icontains=party_drug_physical)
    if party_safety_equip_1:
        queryset = queryset.filter(parties__party_safety_equip_1__icontains=party_safety_equip_1)
    if finan_respons:
        queryset = queryset.filter(parties__finan_respons__icontains=finan_respons)
    if vehicle_year:
        queryset = queryset.filter(parties__vehicle_year__gte=vehicle_year)
    if vehicle_make:
        queryset = queryset.filter(parties__vehicle_make__icontains=vehicle_make)
    if stwd_vehicle_type:
        queryset = queryset.filter(parties__stwd_vehicle_type__icontains=stwd_vehicle_type)
    if inattention:
        queryset = queryset.filter(parties__inattention__icontains=inattention)
    if race:
        queryset = queryset.filter(parties__race__icontains=race)
    if move_pre_acc:
        queryset = queryset.filter(parties__move_pre_acc__icontains=move_pre_acc)

    # Apply filters for Victim Model fields
    if victim_role:
        queryset = queryset.filter(victims__victim_role__icontains=victim_role)
    if victim_sex:
        queryset = queryset.filter(victims__victim_sex__iexact=victim_sex)
    if victim_age:
        queryset = queryset.filter(victims__victim_age__gte=victim_age)
    if victim_degree_of_injury:
        queryset = queryset.filter(victims__victim_degree_of_injury__iexact=victim_degree_of_injury)
    if victim_seating_position:
        queryset = queryset.filter(victims__victim_seating_position__iexact=victim_seating_position)
    if victim_safety_equip_1:
        queryset = queryset.filter(victims__victim_safety_equip_1__iexact=victim_safety_equip_1)
    if victim_ejected:
        queryset = queryset.filter(victims__victim_ejected__iexact=victim_ejected)

    # Serialize the data
    serializer = AccidentSerializer(queryset, many=True)
    return Response(serializer.data)

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class SeverityViewSet(viewsets.ModelViewSet):
    queryset = Severity.objects.all()
    serializer_class = SeveritySerializer

class EnvironmentViewSet(viewsets.ModelViewSet):
    queryset = Environment.objects.all()
    serializer_class = EnvironmentSerializer

class AccidentViewSet(viewsets.ModelViewSet):
    queryset = Accident.objects.all()
    serializer_class = AccidentSerializer

class PartyViewSet(viewsets.ModelViewSet):
    queryset = Party.objects.all()
    serializer_class = PartySerializer

class VictimViewSet(viewsets.ModelViewSet):
    queryset = Victim.objects.all()
    serializer_class = VictimSerializer