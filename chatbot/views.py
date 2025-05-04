from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

@csrf_exempt
@require_POST
def chat(request):
    try:
        # Get request data
        data = json.loads(request.body)
        contents = data.get('contents')
        
        # Input validation
        if not contents or not isinstance(contents, list):
            return JsonResponse(
                {'error': 'Invalid request body: "contents" array is required.'},
                status=400
            )
        
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
        
        return JsonResponse(response.json())
        
    except Exception as e:
        return JsonResponse(
            {'error': 'Failed to fetch response from AI model.'},
            status=500
        )