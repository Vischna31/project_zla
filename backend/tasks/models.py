from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


class Group(models.Model):
    """Учебная группа"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    start_year = models.PositiveIntegerField()  # Год начала обучения
    end_year = models.PositiveIntegerField()    # Год окончания обучения
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.start_year}-{self.end_year})"
    
    class Meta:
        verbose_name = "Группа"
        verbose_name_plural = "Группы"


class UserProfile(models.Model):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Студент'
        TEACHER = 'teacher', 'Преподаватель'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.SET_NULL,
        related_name='students',
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.user.username} ({self.role})"
    
class Discipline(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'todo', 'К выполнению'
        IN_PROGRESS = 'in_progress', 'В процессе'
        DONE = 'done', 'Выполнено'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discipline = models.ForeignKey(
        Discipline,
        on_delete=models.CASCADE,
        related_name='tasks',
        null=True,
        blank=True,
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks',
        null=True,
        blank=True,
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='created_tasks',
        null=True,
        blank=True,
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.SET_NULL,
        related_name='tasks',
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class Reminder(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='reminders',
    )
    remind_at = models.DateTimeField()  # когда напомнить
    created_at = models.DateTimeField(auto_now_add=True)
    is_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"Reminder for {self.task_id} at {self.remind_at}"
