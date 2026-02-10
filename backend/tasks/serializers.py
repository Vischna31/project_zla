from rest_framework import serializers
from .models import Task, Discipline, Reminder


class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discipline
        fields = ["id", "name", "description"]


class TaskSerializer(serializers.ModelSerializer):
    discipline = DisciplineSerializer(read_only=True)
    discipline_id = serializers.PrimaryKeyRelatedField(
        source="discipline",
        queryset=Discipline.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    has_reminder = serializers.SerializerMethodField()
    remind_before_hours = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "deadline",
            "created_at",
            "completed_at",
            "discipline",
            "discipline_id",
            "has_reminder",
            "remind_before_hours",
        ]

    def get_has_reminder(self, obj):
        return obj.reminders.filter(is_sent=False).exists()

    def _create_reminder(self, task, remind_before_hours):
        from django.utils import timezone

        if not task.deadline or not remind_before_hours:
            return

        remind_at = task.deadline - timezone.timedelta(hours=remind_before_hours)
        Reminder.objects.create(task=task, remind_at=remind_at)

    def create(self, validated_data):
        remind_before_hours = validated_data.pop("remind_before_hours", None)
        task = super().create(validated_data)
        self._create_reminder(task, remind_before_hours)
        return task

    def update(self, instance, validated_data):
        remind_before_hours = validated_data.pop("remind_before_hours", None)
        task = super().update(instance, validated_data)

        if remind_before_hours is not None:
            task.reminders.filter(is_sent=False).delete()
            self._create_reminder(task, remind_before_hours)

        return task
