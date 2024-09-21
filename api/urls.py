# api/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('accidents/', views.accident_list, name='accident-list'),
]
