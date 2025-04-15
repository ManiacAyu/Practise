from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/editor/(?P<roomId>[^/]+)/$", consumers.EditorConsumer.as_asgi()),
    re_path(r"ws/draw/(?P<roomId>[^/]+)/$", consumers.DrawConsumer.as_asgi()),
]
