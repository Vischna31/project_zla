from django.contrib import admin
from .models import UserProfile, Discipline, Task, Reminder

@admin.register(Discipline)
class DisciplineAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "status",
        "discipline",
        "student",
        "teacher",
        "deadline",
        "created_at",
    )
    list_filter = ("status", "discipline")
    search_fields = ("title", "description")
    date_hierarchy = "deadline"

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ("id", "task", "remind_at", "is_sent")
    list_filter = ("is_sent",)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_filter = ("role",)
