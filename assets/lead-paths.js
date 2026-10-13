/* Commercial entry routes. Public descriptions; no invented deployment or traction claims. */
export const LEAD_COPY = {
  ru:{
    eyebrow:'Выберите формат взаимодействия',
    title:'От задачи — к конкретному следующему шагу',
    subtitle:'Для каждого запроса — свой маршрут, цель разговора и результат.',
    options:[
      {id:'client',n:'01',title:'Для клиентов',description:'Экономика, закупка, стратегия, процессы и цифровая трансформация бизнеса.',action:'Обсудить задачу',topic:'consulting',goal:'Диагностика или консалтинг'},
      {id:'pilot',n:'02',title:'Для партнёров',description:'Первый пилот, технологическая интеграция или совместный продукт на реальном сценарии.',action:'Предложить пилот',topic:'partnership',goal:'Пилот или партнёрство'},
      {id:'investor',n:'03',title:'Для инвесторов',description:'Проверить стадию проекта, риски и сценарную экономику перед предметным разговором.',action:'Обсудить участие',topic:'investors',goal:'Инвестиционный разговор'}
    ],
    summary:'Ваш маршрут', timingLabel:'Когда планируете начать? (необязательно)',
    timing:[['','Срок пока не определён'],['0–1 month','В течение месяца'],['1–3 months','В течение 1–3 месяцев'],['3–6 months','В течение 3–6 месяцев'],['later','Позднее']],
    modalPilot:'Предложить пилот',modalInvestor:'Инвестору',
    messagePilot:name=>'Хочу обсудить пилот или партнёрское применение проекта «'+name+'». Первый сценарий: ',
    messageInvestor:name=>'Хочу обсудить инвестиционное участие в проекте «'+name+'». Интересуют условия и подтверждённые этапы: '
  },
  en:{
    eyebrow:'Choose how to work together',
    title:'From a question to a concrete next step',
    subtitle:'Clear journeys for prospective clients, partners and investors.',
    options:[
      {id:'client',n:'01',title:'For clients',description:'Buying economics, commercial strategy, operational processes and transformation.',action:'Discuss your challenge',topic:'consulting',goal:'Advisory or diagnosis'},
      {id:'pilot',n:'02',title:'For partners',description:'Explore a pilot, technical integration or co-development on a real workflow.',action:'Propose a pilot',topic:'partnership',goal:'Pilot or technology partnership'},
      {id:'investor',n:'03',title:'For investors',description:'Review product maturity, risks and hypothetical economics before a focused conversation.',action:'Discuss participation',topic:'investors',goal:'Investment discussion'}
    ],
    summary:'Your route',timingLabel:'When would you like to start? (optional)',
    timing:[['','Timing undecided'],['0–1 month','Within a month'],['1–3 months','In 1–3 months'],['3–6 months','In 3–6 months'],['later','Later']],
    modalPilot:'Propose a pilot',modalInvestor:'Investor enquiry',
    messagePilot:name=>'I would like to discuss a pilot or partnership for “'+name+'”. Our first use case: ',
    messageInvestor:name=>'I would like to discuss investing in “'+name+'”. Please clarify the evidence milestones and possible terms: '
  }
};
export const safeLeadRoute=value=>['client','pilot','investor'].includes(value)?value:'';
export const routeForTopic=topic=>topic==='consulting'?'client':topic==='investors'?'investor':(['partnership','launch'].includes(topic)?'pilot':'');
