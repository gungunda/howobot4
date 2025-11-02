/**
 * Верхняя навигация из трёх кнопок.
 */
const buttons = [
  { route: "dashboard", label: "Дашборд" },
  { route: "schedule", label: "Расписание" },
  { route: "calendar", label: "Календарь" },
];

export function renderAppNav(mount, onRoute) {
  mount.innerHTML = "";
  buttons.forEach((b, i) => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.dataset.route = b.route;
    if (i === 0) btn.classList.add("active");
    btn.addEventListener("click", () => onRoute(b.route));
    mount.appendChild(btn);
  });
}
