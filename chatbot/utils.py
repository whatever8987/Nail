from django.db.models import Q
from .models import BusinessKnowledge

def get_business_knowledge(query):
    return BusinessKnowledge.objects.filter(
        Q(question__icontains=query) | Q(answer__icontains=query),
        is_active=True
    ).values('question', 'answer')[:5]  # Limit to 5 most relevant
