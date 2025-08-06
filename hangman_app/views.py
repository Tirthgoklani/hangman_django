import random
from django.shortcuts import render
from django.http import JsonResponse
from .models import Word
from django.db.models.functions import Length

WORD_LENGTHS = {
    'easy': 5,
    'medium': 6,
    'hard': 7,
}

def game(request):
    return render(request, 'hangman_app/game.html')

def start_game(request):
    difficulty = request.GET.get('difficulty', 'easy')
    target_length = WORD_LENGTHS.get(difficulty, 5)

    # Pick a random category that contains a word of the correct length
    eligible_words = Word.objects.annotate(word_len=Length('word')).filter(word_len=target_length)
    if not eligible_words.exists():
        return JsonResponse({'error': 'No eligible words found'}, status=404)

    selected = random.choice(list(eligible_words))
    
    # Save game state in session
    request.session['word'] = selected.word.lower()
    request.session['category'] = selected.category
    request.session['guessed_letters'] = []
    request.session['incorrect_guesses'] = 0

    return JsonResponse({
        'category': selected.category,  # for hint
        'length': len(selected.word),
        'max_incorrect': 5
    })

def guess_letter(request):
    letter = request.GET.get('letter', '').lower()

    if 'word' not in request.session:
        return JsonResponse({'error': 'Game not initialized'}, status=400)

    word = request.session['word']
    guessed = request.session.get('guessed_letters', [])
    incorrect = request.session.get('incorrect_guesses', 0)

    if letter in guessed:
        return JsonResponse({'message': 'Already guessed'})

    guessed.append(letter)

    if letter not in word:
        incorrect += 1

    request.session['guessed_letters'] = guessed
    request.session['incorrect_guesses'] = incorrect

    revealed = [l if l in guessed else '_' for l in word]
    won = '_' not in revealed
    lost = incorrect >= 5

    return JsonResponse({
    'revealed': revealed,
    'incorrect_guesses': incorrect,
    'guessed_letters': guessed,  # <--- ADD THIS
    'won': won,
    'lost': lost,
    'original_word': word if lost else None
})

