from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated # Adjust permissions as needed
from rest_framework.exceptions import ParseError # More specific error for bad input

from datetime import datetime, date, timedelta

from .reports import (
    get_total_visits,
    get_visits_by_day,
    get_unique_visitors_by_ip,
    get_unique_visitors_by_session, # Added unique sessions
    get_unique_authenticated_users,
    get_most_popular_pages,
    get_estimated_unique_visitors # Added estimated unique visitors
)

# Helper to parse date query parameters
def parse_date_params(request):
    """
    Parses 'start_date' and 'end_date' from query parameters.
    Returns date objects or None, and raises ParseError on invalid format.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    start_date = None
    end_date = None

    try:
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    except ValueError:
        raise ParseError("Invalid start_date format. Use YYYY-MM-DD.")

    try:
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        raise ParseError("Invalid end_date format. Use YYYY-MM-DD.")

    return start_date, end_date


class ReportOverviewAPIView(APIView):
    """
    API endpoint to get an overview of key visit metrics.
    Requires admin or staff user permission to access detailed stats.
    Supports optional 'start_date' and 'end_date' query parameters (YYYY-MM-DD).
    Defaults to last 30 days if no dates are provided.
    """
    # Adjust permission class based on who should see these stats
    # IsAdminUser is for Django admin users
    # IsAuthenticated is for any logged-in user
    # If only salon owners should see stats, you need a custom permission class
    permission_classes = [IsAdminUser] # Requires superuser or staff status


    def get(self, request, *args, **kwargs):
        try:
            start_date, end_date = parse_date_params(request)
        except ParseError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


        # --- Set Default Date Range if not provided ---
        # If no dates are given, default to the last 30 days including today
        if start_date is None and end_date is None:
             end_date = date.today()
             start_date = end_date - timedelta(days=29) # Gives 30 days total

        # If only end_date is given, default start_date (e.g. 30 days before end_date)
        elif start_date is None and end_date is not None:
             start_date = end_date - timedelta(days=29)

        # If only start_date is given, default end_date to today
        elif start_date is not None and end_date is None:
            end_date = date.today()

        # Ensure start_date is not after end_date (basic validation)
        if start_date and end_date and start_date > end_date:
             return Response({"error": "start_date cannot be after end_date."}, status=status.HTTP_400_BAD_REQUEST)


        try:
            # --- Fetch Data using Reporting Functions ---
            total_visits = get_total_visits(start_date, end_date)
            unique_ips = get_unique_visitors_by_ip(start_date, end_date)
            unique_authenticated_users = get_unique_authenticated_users(start_date, end_date)
            # Optional: get_unique_visitors_by_session(start_date, end_date)
            estimated_unique_visitors = get_estimated_unique_visitors(start_date, end_date) # Use estimated for dashboard

            visits_by_day_data = get_visits_by_day(start_date, end_date)
            popular_pages_data = get_most_popular_pages(start_date, end_date, limit=10)

            # --- Format Data for Response ---
            # visits_by_day returns date objects, format them as strings (YYYY-MM-DD)
            formatted_visits_by_day = [
                {'day': entry['day'].strftime('%Y-%m-%d'), 'count': entry['count']}
                for entry in visits_by_day_data
            ]

            # popular_pages is already formatted as list of dicts, no change needed

            # --- Construct Response Data ---
            data = {
                "total_visits": total_visits,
                "unique_ips": unique_ips, # May not be useful for dashboard, keep for admin?
                "unique_authenticated_users": unique_authenticated_users, # Might be useful
                "estimated_unique_visitors": estimated_unique_visitors, # Good for overall dashboard metric

                "visits_by_day": formatted_visits_by_day,
                "popular_pages": popular_pages_data,

                "date_range": {
                    "start_date": start_date.strftime('%Y-%m-%d') if start_date else None,
                    "end_date": end_date.strftime('%Y-%m-%d') if end_date else None,
                }
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            # Log the error and return a generic server error
            import logging
            logger = logging.getLogger(__name__)
            logger.error("Error generating tracking report:", exc_info=True)
            return Response({"error": "An internal error occurred while generating the report."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# You can add more API views here if you want separate endpoints for different reports
# e.g., A view for /api/tracking/popular-pages/ that supports different limits or filtering.