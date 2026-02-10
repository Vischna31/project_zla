from rest_framework import viewsets, permissions
from .models import Task, Discipline
from .serializers import TaskSerializer, DisciplineSerializer


class DisciplineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Discipline.objects.all().order_by("name")
    serializer_class = DisciplineSerializer
    permission_classes = [permissions.IsAuthenticated]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(student=user).select_related("discipline")

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
