# Маркап-гайд для переработки шаблона под мобильный HTML/CSS

Этот файл — чек‑лист и каркас для перевёрстки существующего проекта под мобильные устройства. Заполни выделенные поля и флажки. На его основе я сделаю план правок и патчи.

---

## 1) Паспорт задачи
- **Проект**: <!-- впиши название -->
- **Ветка/коммит-основание**: <!-- branch + short SHA -->
- **Шаблон(ы)/страницы к переработке**: <!-- пути файлов, например: index.html, assets/styles.css -->
- **Срок/приоритет**: <!-- если есть ограничения -->

---

## 2) Цели и ограничения (выбери/дополни)
- [ ] Поддержка системного масштабирования шрифта (A11y)
- [ ] Минимальный CLS (без прыжков при загрузке)
- [ ] Тёмная тема через `prefers-color-scheme`
- [ ] Жестовые зоны/вырезы (`safe-area-inset-*`)
- [ ] Производительность LCP/INP (критический CSS, lazy media)
- [ ] Сохранить текущую структуру DOM (минимум изменений разметки)
- [ ] **Не менять** публичные API и экспорт JS (см. §11 правила проекта)
- [ ] Другие: <!-- опиши -->

---

## 3) Файлы проекта (укажи точные пути)
- HTML:
  - [ ] `index.html`
  - [ ] <!-- ... -->
- CSS:
  - [ ] `assets/styles.css`
  - [ ] <!-- ... -->
- Компонентные стили (если есть):
  - [ ] <!-- /ui/.../component.css -->

> ⚠️ По правилам проекта, перед патчами нужен утверждённый **план** и **полные файлы** в бандле. Я буду работать **только с последними версиями** (правила №72, №75–77).

---

## 4) Базовые установки (внедрить/проверить)
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">`
- [ ] Использование `100dvh` вместо `100vh` там, где нужно экран по высоте
- [ ] Базовый `html { font-size: 100%; }` (всё — в `rem`)
- [ ] Сброс `box-sizing: border-box` глобально
- [ ] Логические свойства (`padding-inline`, `margin-block`)

---

## 5) Архитектура CSS слоями (скелет)
Внедряем слои и токены. Если в проекте уже есть методология — отметь, как интегрировать.

```css
/* styles.css */
@layer reset, tokens, base, layout, components, utilities;

@layer tokens {
  :root{
    /* цвета */
    --bg:#fff; --fg:#0b0b0b; --muted:#6b7280; --accent:#2563eb;
    /* отступы */
    --s-1:.5rem; --s-2:1rem; --s-3:1.5rem; --radius:.75rem;
    /* тени/границы при необходимости */
  }
  @media (prefers-color-scheme: dark){
    :root{ --bg:#0b0b0b; --fg:#f3f4f6; --muted:#9ca3af; --accent:#60a5fa; }
  }
}

@layer reset {
  *,*::before,*::after{ box-sizing:border-box; }
  img,svg,video{ max-width:100%; height:auto; display:block; }
}

@layer base {
  html{ font-size:100%; }
  body{
    margin:0; color:var(--fg); background:var(--bg);
    font: 400 1rem/1.55 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    padding-inline: clamp(12px, 4vw, 24px);
    min-height: 100dvh;
  }
}

@layer layout {
  .container{ width:100%; max-width:42rem; margin-inline:auto; display:grid; gap:var(--s-2); }
}

@layer components {
  .card{ border:1px solid color-mix(in oklab, var(--fg) 12%, transparent); border-radius:var(--radius); padding:var(--s-2); background: color-mix(in oklab, var(--bg) 92%, var(--fg)); }
  .btn{ display:inline-flex; align-items:center; justify-content:center; min-height:2.75rem; padding:0 .9rem; border-radius:.65rem; background:var(--accent); color:#fff; border:0; }
  .btn:focus-visible{ outline:2px solid currentColor; outline-offset:2px; }
}

@layer utilities {
  .sr-only{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
}
```

---

## 6) Типографика
- Базовая шкала (заполнить/подтвердить):
  - [ ] `--fs-xs: 0.875rem`
  - [ ] `--fs-sm: 1rem`
  - [ ] `--fs-md: clamp(1rem, 0.9rem + 1vw, 1.125rem)`
  - [ ] `--fs-lg: clamp(1.125rem, 1rem + 2vw, 1.5rem)`
  - [ ] `--fs-xl: clamp(1.25rem, 1.1rem + 3vw, 1.75rem)`
- `line-height`: 1.4–1.6 без единиц
- Политика шрифтов:
  - [ ] Системные шрифты
  - [ ] Веб‑шрифт: <!-- название, начертания, font-display: swap, метрики size-adjust/ascent-override... -->

---

## 7) Единицы измерения — правила
- [ ] Текст/отступы/контролы — `rem`
- [ ] Внутренние иконки — `em`
- [ ] Горизонтальные поля контейнеров — `clamp(..., vw, ...)`
- [ ] Мини/макси‑ограничения — `min()/max()/clamp()`

---

## 8) Сетка и брейкпоинты
- [ ] Mobile‑first
- [ ] Контентные брейки: <!-- 360 / 480 / 768 px? другие? -->
- [ ] @container‑queries (если используем): контейнеры: <!-- классы/селекторы -->
- [ ] Flex для рядов, Grid для карточек/таблиц

Пример карточек:
```css
.grid{ display:grid; grid-template-columns: repeat( auto-fit, minmax(14rem, 1fr) ); gap: var(--s-2); }
```

---

## 9) Нерасползайка и CLS
- [ ] Всем изображениям/медиа задан `aspect-ratio` **или** фикс. размеры
- [ ] `width:100%; height:auto; display:block` для media
- [ ] Кнопки/инпуты ≥ 48×48dp (или паддинги, дающие такой бокс)
- [ ] `@media (prefers-reduced-motion: reduce)` — снижены анимации
- [ ] Вводы текста не < 16px (чтобы iOS не зумил)

---

## 10) Safe area
- [ ] Верх/низ: `padding-block-start/end: max(1rem, env(safe-area-inset-top/bottom));`
- [ ] Inline: `padding-inline: max(1rem, env(safe-area-inset-left/right));`

---

## 11) Производительность загрузки
- [ ] Критический CSS инлайн в `<head>` (минимальный)
- [ ] Остальные стили — отложенная загрузка
- [ ] Изображения AVIF/WebP + `loading="lazy"` + `decoding="async"` + `srcset/sizes`
- [ ] `content-visibility: auto` для длинных списков

---

## 12) Карта компонентов для переработки
Отметь список компонентов/секций, где нужна работа; добавь скриншоты/описания.
- [ ] Header / AppBar
- [ ] Навигация (tabbar/bottom bar)
- [ ] Карточки списка (tasks/items)
- [ ] Формы/модалки
- [ ] Таблицы/гриды
- [ ] Другие: <!-- ... -->

Для каждого компонента опиши текущее поведение и желаемое (кратко):

**Компонент:** <!-- имя -->
- Текущее: <!-- проблемы: фикс. высоты, px‑отступы, прыжки -->
- Нужно: <!-- цель и критерии приемки -->

---

## 13) Критерии приёмки (Definition of Done)
- [ ] Шрифт ↑ на 2 шага в системе — верстка не ломается
- [ ] Переход портрет/альбом — без перепрыгиваний и горизонтального скролла
- [ ] Все кликабельные цели ≥ 48dp
- [ ] Веб‑шрифт (если есть) не даёт CLS‑скачка (метрики настроены)
- [ ] Тьма/свет — корректно
- [ ] Линтер/стайл‑чек пройден (специфичность низкая, вложенность ≤ 2)

---

## 14) План патчей (заполню перед работой, ты утвердишь)
1. **Подключение слоёв и токенов** в `assets/styles.css` (без изменения классов)  
2. **Базовые фиксы**: viewport, 100dvh, box‑sizing, медиа‑правила  
3. **Типографика**: замена px → rem, добавление шкалы  
4. **Сетка**: внедрение Grid/Flex в контейнерах X, Y  
5. **Компоненты**: кнопки/формы/карточки — паддинги в rem, размеры медиа  
6. **Safe area** + тёмная тема токенами  
7. **Оптимизация загрузки**: критический CSS + lazy media  

> После патча я приложу таблицу «План → Факт» и сверку экспортов (правило №77).

---

## 15) Пример вставки в HTML (для согласования)
```html
<!-- head -->
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
<link rel="preload" href="/assets/styles.css" as="style">
<link rel="stylesheet" href="/assets/styles.css">
```

---

## 16) Открытые вопросы
- <!-- перечисли риски/неясности: веб‑шрифты, таббар, sticky‑хедер, и т.п. -->

---

## 17) Приложи скриншоты/макеты (если есть)
- <!-- ссылки/описания -->

