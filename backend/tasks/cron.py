from datetime import datetime, timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from .models import Reminder, Task, UserProfile


def send_due_reminders():
    """Отправка напоминаний о предстоящих дедлайнах"""
    now = timezone.now()
    # Ищем напоминания, которые нужно отправить (в течение последних 5 минут)
    reminders = Reminder.objects.filter(
        remind_at__lte=now,
        is_sent=False
    )
    
    for reminder in reminders:
        task = reminder.task
        user = task.student
        
        if user and user.email:
            # Формируем сообщение
            subject = f'Напоминание: "{task.title}"'
            message = f'''
Добрый день, {user.username}!

Это напоминание о предстоящем дедлайне:

Задача: {task.title}
{task.description if task.description else ''}
Дедлайн: {task.deadline.strftime("%d.%m.%Y %H:%M") if task.deadline else 'Не указан'}

Не забудьте выполнить задание вовремя!

С уважением,
Команда учебной системы
            '''.strip()
            
            try:
                send_mail(
                    subject,
                    message,
                    getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@university.ru'),
                    [user.email],
                    fail_silently=False,
                )
                # Помечаем как отправленное
                reminder.is_sent = True
                reminder.save()
                print(f'Напоминание отправлено {user.email} для задачи {task.title}')
            except Exception as e:
                print(f'Ошибка отправки напоминания: {e}')
        
        # Удаляем старые напоминания (старше 30 дней) - сохраняем историю
        old_reminders = Reminder.objects.filter(
            is_sent=True,
            created_at__lt=now - timedelta(days=30)
        )
        old_reminders.delete()
