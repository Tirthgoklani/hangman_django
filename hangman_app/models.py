from django.db import models

class Word(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('country', 'Country'),
        ('animal', 'Animal'),
        ('sport', 'Sport'),
        ('fruit', 'Fruit'),
        ('random','Random'),
    ]

    word = models.CharField(max_length=50)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    def __str__(self):
        return f"{self.word} ({self.difficulty} - {self.category})"
