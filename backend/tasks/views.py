from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Task, Discipline
from .serializers import TaskSerializer, DisciplineSerializer


class DisciplineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Discipline.objects.all().order_by("name")
    serializer_class = DisciplineSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.select_related("discipline")



    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]      # GET /api/tasks/ без 403
        return [IsAuthenticated()]   # POST/PUT/DELETE под логином

    def perform_create(self, serializer):
        remind_before_hours = self.request.data.get("remind_before_hours")
        serializer.save(
            student=self.request.user,
            remind_before_hours=int(remind_before_hours) if remind_before_hours else None,
        )

    def perform_update(self, serializer):
        remind_before_hours = self.request.data.get("remind_before_hours")
        serializer.save(
            remind_before_hours=int(remind_before_hours) if remind_before_hours else None,
        )
