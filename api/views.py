from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Accident, Victim
from .serializers import AccidentSerializer
from django.db.models import Q

@api_view(['GET'])
def accident_list(request):
    queryset = Accident.objects.select_related('location', 'severity').all()

    # Extract filters from query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    county = request.GET.get('county')
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
