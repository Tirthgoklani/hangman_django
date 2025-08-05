from django.shortcuts import render
from django.http import JsonResponse
from .models import Word
import random

def game(request):
    return render(request, 'hangman_app/game.html')

def get_random_word(request):
    difficulty = request.GET.get('difficulty')
    category = request.GET.get('category')

    words = Word.objects.filter(difficulty=difficulty, category=category)
    if not words.exists():
        return JsonResponse({'error': 'No words found'}, status=404)

    word = random.choice(list(words)).word.lower()

    return JsonResponse({
        'word': word,  # ✅ Sending full word (as you wanted)
    })
