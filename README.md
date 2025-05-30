# Розроблення викладацького та адміністративного функціоналу CRM системи для онлайн-школи (фронтенд і бекенд)


Розроблено CRM-систему для онлайн-школи, яка автоматизує роботу викладачів та надає адміністрації ефективні інструменти для управління навчальним процесом. Система включає функціонал для викладачів, що дозволяє керувати розкладом занять, завантажувати професійні документи (сертифікати, дипломи) та відстежувати успішність студентів. Адміністративна частина дає змогу керувати викладацьким складом, призначати студентів до викладачів, а також контролювати розклади та навантаження. Реалізовано як фронтенд-, так і бекенд-частину системи.

## Автор та керівник
- **Автор**: Боднар Віталій Ігорович
- **Науковий керівник**: Леденцов В'ячеслав В'ячеславович, викладач

## Технології

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **База даних**: PostgreSQL (Supabase)
- **Аутентифікація**: Кастомна з використанням cookies
- **UI Компоненти**: shadcn/ui (базується на Radix UI)
- **Форми**: react-hook-form, zod валідація
- **Графіки та календар**: chart.js, react-big-calendar
- **Шифрування**: crypto-js
- **Стилізація**: Tailwind CSS

## Передумови

Перед запуском проекту переконайтеся, що на вашому комп'ютері встановлено:

- Node.js (версія 18 або новіша)
- npm (версія 8 або новіша) або Yarn
- Git

## Налаштування проекту

### Крок 1: Клонування репозиторію

```bash
git clone https://github.com/Lord2578/bachelor-Bodnar.git
cd dp-next-crm-system
```

### Крок 2: Встановлення залежностей

```bash
npm install
# або якщо використовуєте Yarn
yarn install
```

### Крок 3: Запуск проекту

Запустіть проект у режимі розробки:

```bash
npm run dev
# або
yarn dev
```

Відкрийте [http://localhost:3000] у вашому браузері, щоб побачити сайт.

## Структура проекту (компоненти для викладачів)

- `/app` - Головні сторінки та API маршрути
  - `/api` - API ендпоінти, пов'язані з викладачами
  - `/admin` - Адміністративні сторінки для управління викладачами
  - `/teacher` - Сторінки для викладачів
  - `/login` - Сторінка авторизації
- `/components` - React компоненти
  - `/ui` - UI компоненти (shadcn/ui)
  - `/admin` - Компоненти адмін-панелі для управління викладачами
  - `/teacher` - Компоненти для викладачів
- `/lib` - Утилітарні функції та підключення до бази даних
- `/public` - Статичні файли

## Основні функції

1. **Адміністративна панель (функції пов'язані з викладачами)**
   - Управління викладачами
     - Створення облікових записів викладачів з заповненням профілю
   - Управління розкладом викладачів
     - Призначення учнів до викладачів
     - Перегляд зайнятості викладачів
     - Вирішення конфліктів у розкладі
   - Управління оплатою викладачів
     - Перегляд зарплат за різні періоди
     - Розрахунок зарплати на основі проведених годин
     - Налаштування ставок оплати

2. **Панель викладача**
   - Інформаційна панель
     - Перегляд запланованих занять на поточний день
     - Список призначених студентів
     - Перегляд нових домашніх завдань, які потребують перевірки
   - Управління розкладом занять
     - Перегляд розкладу в форматах день/тиждень/місяць
     - Створення нових занять з вибором студента та часу
     - Позначення занять як проведених
   - Завантаження сертифікатів
     - Завантаження файлів сертифікатів у форматі PDF/JPG
     - Додавання опису до сертифікатів
     - Перегляд завантажених сертифікатів
   - Управління призначеними студентами
     - Перегляд списку студентів
     - Перегляд інформації про студентів
   - Інформація про зарплату
     - Перегляд розрахованих виплат
     - Моніторинг проведених годин

