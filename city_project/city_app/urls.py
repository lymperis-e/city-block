from . import views
from django.urls import path, re_path, include




urlpatterns = [
    re_path(r'^$', views.home, name='home'),
    path('attributes/<slug:otid>/', views.featureInfo, name='featureinfo'),
    #path('viewer/<slug:slug>/', views.viewer, name='viewer'),
]