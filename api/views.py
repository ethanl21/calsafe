from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Location, Severity, Environment, Accident, Party, Victim
from .serializers import (LocationSerializer, SeveritySerializer, EnvironmentSerializer, 
                          AccidentSerializer, PartySerializer, VictimSerializer)
from django.db.models import Q

@api_view(['GET'])
def accident_list(request):
    queryset = Accident.objects.select_related('location', 'severity').all()

    # Extract filters from query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    county = request.GET.get('county')
    city = request.GET.get('city')
    crash_types = request.GET.get('crash_types')
    victim_filters = request.GET.get('victim_filters')

    # Apply date range filter
    if start_date and end_date:
        queryset = queryset.filter(collision_date__range=[start_date, end_date])
    elif start_date:
        queryset = queryset.filter(collision_date__gte=start_date)
    elif end_date:
        queryset = queryset.filter(collision_date__lte=end_date)

    # Apply county filter
    if county:
        queryset = queryset.filter(location__county__icontains=county)

    # Apply city filter
    if city:
        queryset = queryset.filter(location__city__icontains=city)

    # Apply crash types filter
    if crash_types:
        crash_types_list = crash_types.split(',')
        queryset = queryset.filter(type_of_collision__in=crash_types_list)

    # Apply victim filters
    if victim_filters:
        victim_filters_list = victim_filters.split(',')
        queryset = queryset.filter(
            victim__victim_degree_of_injury__in=victim_filters_list
        ).distinct()

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