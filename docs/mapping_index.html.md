# Этап 10 — Карта навешивания по index.html

Ниже — конкретное сопоставление классов из `assets/styles.css` к узлам в вашем `index.html` (версия из чата). Разметку **не меняем**, только подтверждаем соответствие и даём опциональные рекомендации.

## Шапка
- `<header class="topbar">` — ✔ соответствует.
- `<div class="topbar-title">` — ✔ соответствует.
- `<nav class="topbar-nav">` + кнопки `.btn` — ✔ соответствует.

## Основной контейнер
- `<main class="main">` — ✔ соответствует (активирует container queries).

## DASHBOARD VIEW
- `<section class="view is-active" data-view="dashboard">` — ✔ соответствует.
- `<h2 class="section-title">` — ✔ соответствует.
- `.stats-row > .stat-box` — ✔ соответствует.
- `.section > .section-head` — ✔ теперь получил базовую раскладку (см. Stage 10 additions).
- Списки задач: `<div class="task-list" data-dashboard-tasks>` — ✔ соответствует.
- Блок разгрузки: `.section[data-dashboard-offload-wrapper]` + `.task-list[data-dashboard-offload]` — ✔ соответствует.

## SCHEDULE VIEW
- `<section class="view" data-view="schedule">` + `<div class="week-grid" data-schedule-week>` — ✔ соответствует.

## CALENDAR VIEW
- `.calendar-header` — теперь центрируется, см. Stage 10 additions.
- Кнопки навигации календаря: `.btn` — ✔ соответствует.
- Метка месяца: `<span class="cal-label" data-calendar-label>` — получил стили `.cal-label` (см. additions).
- `.calendar-grid` — ✔ соответствует; для ячеек календаря в JS добавляются модификаторы `.is-head/.is-outside-month/.is-today/.is-selected` — стили уже есть.

## Футер
- `<footer class="footer">` — ✔ соответствует.

### Итог
- **HTML/JS не менялись.** Добавлены лишь минимальные CSS-склейки под существующие классы:
  - `.section-head` — гибкая раскладка кнопок.
  - `.calendar-header` — центрирование контента.
  - `.cal-label` — читаемая метка месяца.

## Рекомендации (опционально)
- Для кнопок «Очистить день» / «Вернуть к расписанию» можно добавить `.btn-group`, если они должны держаться вместе.
- Если в карточках задач есть заголовки/панель действий, можно навесить `.card-title`/`.card-actions` без смены DOM-структуры.


