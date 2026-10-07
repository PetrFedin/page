import { PROJECTS } from './content.js?v=202610041955';

const byId = (id) => PROJECTS.find((item) => item.id === id);

const syntha = byId('syntha');
if (syntha) {
  const ruSupplier = 'История работы с поставщиками и пакет подтверждений для партнёра';
  const enSupplier = 'Supplier history and a partner-ready proof package';
  if (!syntha.ru.status.done.includes(ruSupplier)) syntha.ru.status.done.push(ruSupplier);
  if (!syntha.en.status.done.includes(enSupplier)) syntha.en.status.done.push(enSupplier);
  syntha.ru.status.now[0] = 'Доведение работы с поставщиками и производственными партнёрами до пилотного сценария';
  syntha.en.status.now[0] = 'Bringing supplier and production-partner workflows to pilot use';
  syntha.ru.card = 'Ключевые продуктовые и коммерческие сценарии уже собраны в единой рабочей системе: от подготовки коллекции и работы с партнёрами до заказа, исполнения и контроля экономики. Работа с поставщиками теперь включает историю и пакет подтверждений для делового взаимодействия с партнёром. Следующий проверяемый рубеж — пилот на реальном сезоне.';
  syntha.en.card = 'Core product and commercial workflows are already connected in one working system, from collection preparation and partner collaboration to order execution and economics. Supplier work now includes a structured history and a partner-ready proof package for business collaboration. The next verifiable milestone is a real-season pilot.';
}

const mfw = byId('mfw');
if (mfw) {
  mfw.ru.roadmap = [
    { label: 'Расширенный MVP', state: 'done' },
    { label: 'Готовность к пилоту', state: 'current' },
    { label: 'Пилот на реальном событии', state: 'next' }
  ];
  mfw.ru.card = 'MFW, BFS и «Сделано в Москве» объединены в одну fashion-экосистему с общим аккаунтом, персональным маршрутом, взаимодействием с брендами, B2B-сценариями и аналитикой. В рабочей версии история участия организации и её представителей может сохраняться между событиями, поддерживая следующий цикл участия и B2B-продолжение. Следующий рубеж — пилот на реальном событии и проверка ценности между сезонами.';
  mfw.en.card = 'MFW, BFS and Made in Moscow are connected in one fashion ecosystem with shared identity, personal journeys, brand interaction, B2B workflows and analytics. In the working version, an organisation’s participation history and representatives can carry forward between events, supporting the next participation cycle and B2B follow-up. The next milestone is a real-event pilot and validation of value between seasons.';
}

const promomed = byId('promomed');
if (promomed) {
  promomed.ru.roadmap = [
    { label: 'Live v1.4', state: 'done' },
    { label: 'Готовность к контролируемому пилоту', state: 'current' },
    { label: 'Контролируемый пилот', state: 'next' }
  ];
}
