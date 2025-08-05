from django.urls import path
from . import views

urlpatterns = [
    path('', views.game, name='game'),
    path('get_random_word/', views.get_random_word, name='get_random_word'),
]
