from django.urls import path
from . import views

urlpatterns = [
    path('', views.game, name='game'),
    path('start_game/', views.start_game, name='start_game'),
    path('guess_letter/', views.guess_letter, name='guess_letter'),
]
