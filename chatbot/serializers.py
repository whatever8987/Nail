# In chatbot/serializers.py
from rest_framework import serializers

class ChatSerializer(serializers.Serializer):
    contents = serializers.ListField(child=serializers.DictField())