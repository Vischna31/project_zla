from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tasks.views import TaskViewSet, DisciplineViewSet, GroupViewSet, LoginView, register_view, logout_view, user_detail_view, dashboard_view  # ← добавлены GroupViewSet и dashboard_view

router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"disciplines", DisciplineViewSet, basename="discipline")
router.register(r"groups", GroupViewSet, basename="group")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/login/", LoginView.as_view(), name="api-login"),
    path("api/register/", register_view, name="api-register"),
    path("api/logout/", logout_view, name="api-logout"),
    path("api/user/", user_detail_view, name="api-user-detail"),
    path("api/dashboard/", dashboard_view, name="api-dashboard"),
    path("api-auth/", include("rest_framework.urls")),
]
