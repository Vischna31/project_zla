from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, Discipline, Reminder, UserProfile, Group


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name", "description", "start_year", "end_year"]


class UserProfileSerializer(serializers.ModelSerializer):
    group = GroupSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ["role", "group"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
        ]


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
    group = GroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        source="group",
        queryset=Group.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    student = UserSerializer(read_only=True)
    # student_id игнорируем - устанавливаем в perform_create
    has_reminder = serializers.SerializerMethodField()

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
            "group",
            "group_id",
            "student",
            "has_reminder",
        ]

    def get_has_reminder(self, obj):
        return Reminder.objects.filter(task=obj, is_sent=False).exists()
