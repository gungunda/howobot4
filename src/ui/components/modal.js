/**
 * Универсальные утилиты модалки.
 * Создаёт один общий контейнер [data-modal] и предоставляет open/close.
 * Используется на Дашборде и в Расписании.
 */

/** Гарантировать наличие контейнера модалки в DOM. */
export function ensureModalRoot(){
  let modal = document.querySelector("[data-modal]");
  if (!modal){
    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("data-modal","");
    modal.setAttribute("hidden","");
    modal.innerHTML = `
      <div class="modal-backdrop" data-modal-close></div>
      <div class="modal-card">
        <button class="modal-close" data-modal-close aria-label="Закрыть">×</button>
        <div data-modal-body></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  return modal;
}

/**
 * Открыть модалку с узлом контента.
 * Навешивает обработчики на [data-modal-close], [data-cancel], [data-save].
 * @param {HTMLElement} contentNode
 * @param {object} [opts]
 * @param {function} [opts.onSave]
 */
export function openModal(contentNode, opts = {}){
  const modal = ensureModalRoot();
  const body = modal.querySelector("[data-modal-body]");
  body.innerHTML = "";
  body.appendChild(contentNode);

  modal.removeAttribute("hidden");
  modal.setAttribute("open","");

  const close = () => closeModal();

  // Закрытие по крестику/бекдропу
  modal.querySelectorAll("[data-modal-close]").forEach(el => {
    el.addEventListener("click", close, { once: true });
  });

  // Кнопки формы
  const saveBtn = modal.querySelector("[data-save]");
  const cancelBtn = modal.querySelector("[data-cancel]");
  if (cancelBtn) cancelBtn.addEventListener("click", close, { once: true });
  if (saveBtn) saveBtn.addEventListener("click", () => { opts.onSave?.(); close(); }, { once: true });

  return close;
}

/** Закрыть и очистить модалку. */
export function closeModal(){
  const modal = document.querySelector("[data-modal]");
  if (!modal) return;
  modal.removeAttribute("open");
  modal.setAttribute("hidden","");
  const body = modal.querySelector("[data-modal-body]");
  if (body) body.innerHTML = "";
}


