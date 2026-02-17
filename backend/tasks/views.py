from datetime import datetime, timedelta

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings

from .models import Task, Discipline, Reminder, UserProfile, Group
from .serializers import TaskSerializer, DisciplineSerializer, UserSerializer, UserProfileSerializer, GroupSerializer


class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        # Проверяем валидность логина/пароля
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {"error": "Username и password обязательны"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"error": "Неверный логин или пароль"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем или создаем токен
        token, created = Token.objects.get_or_create(user=user)
        
        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "profile": {
                        "role": user.profile.role if hasattr(user, 'profile') else None,
                    },
                },
            },
            status=status.HTTP_200_OK,
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Регистрация нового пользователя"""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    role = request.data.get('role', 'student')

    if not username or not password:
        return Response(
            {"error": "Username и password обязательны"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Пользователь с таким именем уже существует"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )

    # Всегда создаем профиль пользователя
    UserProfile.objects.create(
        user=user,
        role=role
    )

    return Response(
        {
            "message": "Пользователь успешно зарегистрирован",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile": {
                    "role": user.profile.role,
                },
            },
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Выход из системы (удаление токена)"""
    try:
        request.user.auth_token.delete()
        logout(request)
        return Response(
            {"message": "Успешный выход"},
            status=status.HTTP_200_OK
        )
    except Exception:
        return Response(
            {"error": "Ошибка при выходе"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_view(request):
    """Получение данных текущего пользователя"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """Дашборд для преподавателей"""
    user = request.user
    profile = getattr(user, 'profile', None)
    
    # Только преподаватели могут видеть дашборд
    if not profile or profile.role != 'teacher':
        return Response(
            {"error": "Доступ запрещен"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Фильтруем задачи: только те, которые создал преподаватель ИЛИ относятся к его группе
    from .models import Group
    
    # Получаем группы, в которых преподаватель ведет занятия
    # Для простоты - показываем задачи, созданные преподавателем
    teacher_tasks = Task.objects.filter(teacher=user)
    
    # Статистика по всем задачам преподавателя
    total_tasks = teacher_tasks.count()
    pending_tasks = teacher_tasks.filter(status='todo').count()
    in_progress_tasks = teacher_tasks.filter(status='in_progress').count()
    done_tasks = teacher_tasks.filter(status='done').count()
    overdue_tasks = teacher_tasks.filter(
        status__in=['todo', 'in_progress'],
        deadline__lt=timezone.now()
    ).count()
    
    # Статистика по группам (только для задач преподавателя)
    groups = Group.objects.filter(tasks__teacher=user).distinct()
    groups_stats = []
    for group in groups:
        group_tasks = teacher_tasks.filter(group=group)
        groups_stats.append({
            'id': group.id,
            'name': group.name,
            'total': group_tasks.count(),
            'pending': group_tasks.filter(status='todo').count(),
            'in_progress': group_tasks.filter(status='in_progress').count(),
            'done': group_tasks.filter(status='done').count(),
            'overdue': group_tasks.filter(
                status__in=['todo', 'in_progress'],
                deadline__lt=timezone.now()
            ).count(),
        })
    
    # Статистика по дисциплинам (только для задач преподавателя)
    disciplines_stats = []
    for discipline in Discipline.objects.filter(tasks__teacher=user).distinct():
        disc_tasks = teacher_tasks.filter(discipline=discipline)
        disciplines_stats.append({
            'id': discipline.id,
            'name': discipline.name,
            'total': disc_tasks.count(),
            'pending': disc_tasks.filter(status='todo').count(),
            'in_progress': disc_tasks.filter(status='in_progress').count(),
            'done': disc_tasks.filter(status='done').count(),
        })
    
    return Response({
        'total_tasks': total_tasks,
        'pending_tasks': pending_tasks,
        'in_progress_tasks': in_progress_tasks,
        'done_tasks': done_tasks,
        'overdue_tasks': overdue_tasks,
        'groups_stats': groups_stats,
        'disciplines_stats': disciplines_stats,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_tasks_csv(request):
    """Экспорт задач в CSV"""
    user = request.user
    profile = getattr(user, 'profile', None)
    
    # Только преподаватели могут экспортировать
    if not profile or profile.role != 'teacher':
        return Response(
            {"error": "Доступ запрещен"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    import csv
    from django.http import HttpResponse
    
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="tasks_export.csv"'
    
    writer = csv.writer(response, delimiter=';')
    writer.writerow(['ID', 'Заголовок', 'Описание', 'Статус', 'Дисциплина', 'Группа', 'Студент', 'Дедлайн', 'Создано'])
    
    tasks = Task.objects.all().select_related('discipline', 'group', 'student')
    
    for task in tasks:
        writer.writerow([
            task.id,
            task.title,
            task.description,
            task.get_status_display(),
            task.discipline.name if task.discipline else '',
            task.group.name if task.group else '',
            task.student.username if task.student else '',
            task.deadline.strftime('%d.%m.%Y %H:%M') if task.deadline else '',
            task.created_at.strftime('%d.%m.%Y %H:%M'),
        ])
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_tasks_csv(request):
    """Импорт задач из CSV"""
    user = request.user
    profile = getattr(user, 'profile', None)
    
    # Только преподаватели могут импортировать
    if not profile or profile.role != 'teacher':
        return Response(
            {"error": "Доступ запрещен"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if 'file' not in request.FILES:
        return Response(
            {"error": "Файл не загружен"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    import csv
    import io
    
    file = request.FILES['file']
    decoded_file = file.read().decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file, delimiter=';')
    
    created_count = 0
    skipped_count = 0
    errors = []
    
    for row_num, row in enumerate(reader, start=2):  # start=2 т.к. строка 1 - заголовок
        try:
            # Проверка обязательных полей
            title = row.get('title', '').strip()
            if not title:
                errors.append(f"Строка {row_num}: отсутствует заголовок")
                skipped_count += 1
                continue
            
            discipline = None
            if row.get('discipline_id'):
                try:
                    discipline = Discipline.objects.filter(id=row['discipline_id']).first()
                except ValueError:
                    pass
            
            group = None
            if row.get('group_id'):
                try:
                    group = Group.objects.filter(id=row['group_id']).first()
                except ValueError:
                    pass
            
            student = None
            if row.get('student_id'):
                try:
                    student = User.objects.filter(id=row['student_id']).first()
                except ValueError:
                    pass
            
            deadline = None
            if row.get('deadline'):
                try:
                    deadline = datetime.strptime(row['deadline'], '%d.%m.%Y %H:%M')
                except ValueError:
                    pass
            
            Task.objects.create(
                title=title,
                description=row.get('description', '').strip(),
                status=row.get('status', 'todo'),
                discipline=discipline,
                group=group,
                student=student,
                teacher=user,
                deadline=deadline,
            )
            created_count += 1
        except Exception as e:
            errors.append(f"Строка {row_num}: {str(e)}")
            skipped_count += 1
            continue
    
    response_data = {
        "message": f"Успешно импортировано {created_count} задач",
        "created_count": created_count,
        "skipped_count": skipped_count,
    }
    
    if errors:
        response_data["errors"] = errors[:10]  # Показать первые 10 ошибок
    
    return Response(response_data)
    
class DisciplineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Discipline.objects.all().order_by("name")
    serializer_class = DisciplineSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [AllowAny]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        
        # Если пользователь - преподаватель, показываем только свои задачи
        if profile and profile.role == 'teacher':
            return Task.objects.filter(teacher=user).select_related("discipline", "student", "group")
        
        # Если пользователь - студент, показываем только свои задачи
        return Task.objects.filter(student=user).select_related("discipline", "group")

    def perform_create(self, serializer):
        # Игнорируем student_id из данных - устанавливаем текущего пользователя
        data = self.request.data.copy()
        data.pop('student_id', None)
        
        # Всегда используем текущего пользователя как студента
        task = serializer.save(student=self.request.user)
        remind_before_hours = self.request.data.get("remind_before_hours")

        if remind_before_hours and task.deadline:
            try:
                hours = int(remind_before_hours)
            except (TypeError, ValueError):
                hours = None

            if hours is not None:
                remind_at = task.deadline - timedelta(hours=hours)
                Reminder.objects.create(task=task, remind_at=remind_at)

        # Отправка email-уведомления студенту при создании задачи
        # НЕ прерываем создание задачи, если email не отправлен
        if task.student and task.student.email:
            try:
                subject = f'Новая задача: "{task.title}"'
                message = f'''
Добрый день, {task.student.username}!

Вам назначена новая учебная задача:

Задача: {task.title}
{task.description if task.description else ''}
Дисциплина: {task.discipline.name if task.discipline else 'Без дисциплины'}
Дедлайн: {task.deadline.strftime("%d.%m.%Y %H:%M") if task.deadline else 'Не указан'}

Пожалуйста, выполните задание вовремя!

С уважением,
Команда учебной системы
                '''.strip()
                
                send_mail(
                    subject,
                    message,
                    getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@university.ru'),
                    [task.student.email],
                    fail_silently=True,  # Не прерываем, если email не отправлен
                )
            except Exception as e:
                print(f'Ошибка отправки email: {e}')

    def perform_update(self, serializer):
        remind_before_hours = self.request.data.get("remind_before_hours")
        task = serializer.save()

        task.reminders.all().delete()

        if remind_before_hours and task.deadline:
            try:
                hours = int(remind_before_hours)
            except (TypeError, ValueError):
                hours = None

            if hours is not None:
                remind_at = task.deadline - timedelta(hours=hours)
                Reminder.objects.create(task=task, remind_at=remind_at)

        # Отправка email-уведомления при обновлении задачи
        # НЕ прерываем обновление, если email не отправлен
        if task.student and task.student.email:
            try:
                subject = f'Обновление задачи: "{task.title}"'
                message = f'''
Добрый день, {task.student.username}!

Обновлена ваша задача:

Задача: {task.title}
{task.description if task.description else ''}
Дисциплина: {task.discipline.name if task.discipline else 'Без дисциплины'}
Дедлайн: {task.deadline.strftime("%d.%m.%Y %H:%M") if task.deadline else 'Не указан'}
Статус: {task.get_status_display()}

Пожалуйста, проверьте изменения!

С уважением,
Команда учебной системы
                '''.strip()
                
                send_mail(
                    subject,
                    message,
                    getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@university.ru'),
                    [task.student.email],
                    fail_silently=True,  # Не прерываем, если email не отправлен
                )
            except Exception as e:
                print(f'Ошибка отправки email: {e}')
