/* Isolated V2 presentation; original content and project registry are preserved. */
export function renderV2(lang) {
  const en = lang === 'en';
  document.documentElement.dataset.preview = 'v2';
  const $ = (s) => document.querySelector(s);
  if (!$('#v2-banner')) {
    const bar = document.createElement('aside'); bar.id = 'v2-banner';
    document.body.prepend(bar);
  }
  $('#v2-banner').innerHTML = `<span>V2 · ${en ? 'Preview for comparison' : 'Версия для сравнения'}</span><a href="https://syntha.pro/${en ? 'en/' : ''}" target="_blank" rel="noopener">${en ? 'Open current version ↗' : 'Открыть текущую версию ↗'}</a>`;
  if (!$('#v2-headline')) {
    const h = document.createElement('h2'); h.id = 'v2-headline';
    $('.hero-id').after(h);
  }
  $('#v2-headline').textContent = en ? 'Profit, inventory and growth. Decisions grounded in economics.' : 'Прибыль, запасы и рост. Решения на основе экономики.';
  $('#hero-lead').textContent = en ? 'I help fashion businesses connect buying, products, sales and cash — and turn the findings into working processes and digital tools.' : 'Помогаю фэшн-бизнесу связать закупку, продукт, продажи и деньги — и перевести выводы в рабочие процессы и цифровые инструменты.';
  $('#cta-contact').textContent = en ? 'Discuss your challenge' : 'Обсудить задачу';
  $('#cta-contact').classList.add('btn-primary'); $('#cta-consulting').classList.remove('btn-primary');
  if (!$('#v2-routes')) {
    const section = document.createElement('section'); section.id = 'v2-routes'; section.className = 'section v2-routes';
    $('.hero').after(section);
  }
  const routes = en ? [
    ['01','For your business','Advisory','Buying, profitability, working capital and management decisions.','Explore services','#consulting'],
    ['02','For your product','Products & development','Own products, working prototypes and formats for building together.','Explore the portfolio','#projects'],
    ['03','For a shared opportunity','Partnership','Pilots, strategic collaboration and investment discussions.','Explore ways to work together','#investors']
  ] : [
    ['01','Для вашего бизнеса','Консалтинг','Закупка, прибыльность, оборотный капитал и управленческие решения.','Выбрать формат работы','#consulting'],
    ['02','Для вашего продукта','Проекты и разработка','Собственные продукты, рабочие прототипы и форматы совместного запуска.','Посмотреть весь портфель','#projects'],
    ['03','Для совместного развития','Партнёрство','Пилоты, стратегическое сотрудничество и обсуждение инвестиций.','Посмотреть варианты участия','#investors']
  ];
  $('#v2-routes').innerHTML = `<p class="eyebrow">${en ? 'Where shall we start?' : 'С чего начнём?'}</p><div class="v2-route-grid">${routes.map(r=>`<a class="v2-route" href="${r[5]}"><span class="v2-route-meta">${r[0]} / ${r[1]}</span><h3>${r[2]}</h3><p>${r[3]}</p><span class="v2-route-action">${r[4]} →</span></a>`).join('')}</div>`;
  if (!$('#v2-steps')) {
    const section = document.createElement('section'); section.id = 'v2-steps'; section.className = 'section v2-steps';
    $('#contact').before(section);
  }
  const steps = en ? [['Your challenge','Describe the situation and the outcome you need.'],['Scope of work','We clarify the data, constraints, deliverables and terms.'],['A clear next step','Agree the format and acceptance criteria before starting.']] : [['Ваша задача','Расскажите о ситуации и результате, который вам нужен.'],['Границы работы','Уточним данные, ограничения, состав результата и условия.'],['Понятный следующий шаг','Согласуем формат и критерии результата до начала работы.']];
  $('#v2-steps').innerHTML = `<div class="section-head"><h2>${en ? 'How we start' : 'Как начинается работа'}</h2></div><div class="v2-step-grid">${steps.map((s,i)=>`<article><span class="svc-n">0${i+1}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join('')}</div>`;
  $('#contact-sub').textContent = en ? 'Your name, one way to reach you and a few words about your challenge are enough to start.' : 'Для начала достаточно имени, одного способа связи и нескольких слов о задаче.';
  if (!$('#v2-contact-method')) {
    const label = document.createElement('label'); label.className = 'field'; label.id = 'v2-method-field';
    label.innerHTML = '<span></span><select id="v2-contact-method"><option value="email">Email</option><option value="telegram">Telegram</option><option value="phone"></option></select>';
    $('#email').closest('label').before(label);
    const setMethod = () => {
      const method = $('#v2-contact-method').value;
      $('#opt-telegram').checked = method === 'telegram';
      $('#opt-phone').checked = method === 'phone';
      $('#opt-telegram').dispatchEvent(new Event('change'));
      $('#email').closest('label').hidden = method !== 'email';
      if (method !== 'email') $('#email').value = '';
      $('#form').dispatchEvent(new Event('input'));
    };
    $('#v2-contact-method').addEventListener('change', setMethod);
    setMethod();
    $('#opt-telegram').closest('.opt-row').hidden = true;
  }
  $('#v2-method-field > span').textContent = en ? 'How can I reach you?' : 'Как с вами связаться?';
  $('#v2-contact-method option[value="phone"]').textContent = en ? 'Phone' : 'Телефон';
  if (!$('#v2-form-note')) {
    const note = document.createElement('p'); note.id = 'v2-form-note'; note.className = 'v2-preview-note'; $('#form').prepend(note);
  }
  $('#v2-form-note').textContent = en ? 'Preview mode: the form validates your input but does not send or save an enquiry. Direct contact links remain available.' : 'Режим просмотра: форма проверяет заполнение, но не отправляет и не сохраняет заявку. Для реального обращения доступны прямые контакты.';
  $('#submit').textContent = en ? 'Check enquiry · preview' : 'Проверить заявку · просмотр';
  document.querySelectorAll('#turnstile-widget').forEach(el => el.replaceChildren());
  const barLink = $('#cta-bar a');
  if (barLink) {barLink.textContent = en ? 'Discuss a challenge' : 'Обсудить задачу';}
}
