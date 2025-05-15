from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import ChatConversation, ChatMessage
import requests
import json
import os
from dotenv import load_dotenv
import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import ChatConversationSerializer
load_dotenv()

User = get_user_model()  # Get the active user model

def get_business_knowledge(query):
    """
    Retrieve relevant business knowledge based on user query
    Implement this function based on your knowledge base structure
    """
    # This is a placeholder - implement your actual knowledge retrieval
    return []

def get_or_create_conversation(request, session_id):
    user = request.user if request.user.is_authenticated else None
    ip = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT')
    
    conversation, created = ChatConversation.objects.get_or_create(
        session_id=session_id,
        defaults={
            'user': user,
            'ip_address': ip,
            'user_agent': user_agent
        }
    )
    return conversation

@csrf_exempt
@require_POST
def chat(request):
    try:
        # Get request data
        data = json.loads(request.body)
        contents = data.get('contents')
        session_id = data.get('session_id', str(uuid.uuid4()))  # Generate new if not provided
        
        # Input validation
        if not contents or not isinstance(contents, list):
            return JsonResponse(
                {'error': 'Invalid request body: "contents" array is required.'},
                status=400
            )
        
        # Get conversation
        conversation = get_or_create_conversation(request, session_id)
        
        # Log user message (last item in contents is the user's latest message)
        user_message = contents[-1]['parts'][0]['text'] if contents and contents[-1]['role'] == 'user' else None
        if user_message:
            ChatMessage.objects.create(
                conversation=conversation,
                content=user_message,
                is_from_user=True
            )
        
            # Get business knowledge relevant to this message
            business_info = "\n".join([f"Q: {item['question']}\nA: {item['answer']}" 
                              for item in get_business_knowledge(user_message)])

            business_context = {
                "role": "user",
                "parts": [{
                    "text": f"""
                    You are a customer support assistant for [Your Business Name]. 
                    Here's some key information about our business:
                    
                    {business_info}
                    
                    Always respond in a friendly, professional tone. If the answer isn't 
                    in the provided information, say you don't know and direct them to 
                    our contact channels.
                    """
                }]
            }
            
            # Insert business context at the beginning if it's a new conversation
            if len(contents) == 1:  # Assuming first message is user's initial message
                contents.insert(0, business_context)
        
        # Get API key
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            return JsonResponse(
                {'error': 'Server configuration error.'},
                status=500
            )
        
        # Call Google API
        google_api_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}'
        
        response = requests.post(
            google_api_url,
            json={'contents': contents},
            headers={'Content-Type': 'application/json'}
        )
        
        # Handle Google API response
        if not response.ok:
            error_data = response.json()
            error_msg = error_data.get('error', {}).get('message', f'API Error: {response.status_code}')
            return JsonResponse(
                {'error': error_msg},
                status=response.status_code
            )
        
        response_data = response.json()
        
        # Log bot response
        if 'candidates' in response_data and response_data['candidates']:
            bot_response = response_data['candidates'][0]['content']['parts'][0]['text']
            ChatMessage.objects.create(
                conversation=conversation,
                content=bot_response,
                is_from_user=False
            )
        
        # Include session_id in response for future requests
        response_data['session_id'] = session_id
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'error': 'Invalid JSON format in request body.'},
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {'error': f'Failed to process request: {str(e)}'},
            status=500
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_list(request):
    conversations = ChatConversation.objects.filter(user=request.user).order_by('-started_at')
    # You'll need to define ChatConversationSerializer
    serializer = ChatConversationSerializer(conversations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, pk):
    try:
        conversation = ChatConversation.objects.get(pk=pk, user=request.user)
        # You'll need to define ChatConversationSerializer
        serializer = ChatConversationSerializer(conversation)
        return Response(serializer.data)
    except ChatConversation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)