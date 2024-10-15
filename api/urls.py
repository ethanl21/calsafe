# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, SeverityViewSet, EnvironmentViewSet, AccidentViewSet, PartyViewSet, VictimViewSet, accident_list

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'severities', SeverityViewSet)
router.register(r'environments', EnvironmentViewSet)
router.register(r'accidents', AccidentViewSet)
router.register(r'parties', PartyViewSet)
router.register(r'victims', VictimViewSet)

urlpatterns = [
    path('accidents/', accident_list, name='accident-list'),
    path('', include(router.urls)),
]
