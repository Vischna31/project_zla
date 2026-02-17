from django.contrib import admin
from .models import Group, UserProfile, Discipline, Task, Reminder

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "start_year", "end_year", "description")
    search_fields = ("name",)
    list_filter = ("start_year", "end_year")

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
        "group",
        "student",
        "teacher",
        "deadline",
        "created_at",
    )
    list_filter = ("status", "discipline", "group")
    search_fields = ("title", "description")
    date_hierarchy = "deadline"

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ("id", "task", "remind_at", "is_sent")
    list_filter = ("is_sent",)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "group")
    list_filter = ("role", "group")
