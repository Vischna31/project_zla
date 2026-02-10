from django.utils import timezone
from django.core.mail import send_mail
from .models import Reminder

def send_due_reminders():
    now = timezone.now()
    reminders = (
        Reminder.objects
        .filter(remind_at__lte=now, is_sent=False)
        .select_related("task", "task__student")
    )

    for reminder in reminders:
        task = reminder.task
        user = task.student

        if user and user.email:
            send_mail(
                subject=f"Напоминание о задаче: {task.title}",
                message=f"Задача: {task.title}\nДедлайн: {task.deadline}",
                from_email="no-reply@example.com",
                recipient_list=[user.email],
                fail_silently=True,
            )

        reminder.is_sent = True
        reminder.save()
