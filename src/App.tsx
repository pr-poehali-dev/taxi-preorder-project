import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/424e9b96-e72f-43df-bff3-dd0f3450ab89";

type Page = "home" | "booking" | "orders" | "routes" | "profile" | "support";

interface Order {
  id: number;
  order_number: string;
  city_from: string;
  city_to: string;
  trip_date: string;
  trip_time: string;
  passengers: number;
  comment: string;
  price: number;
  status: string;
  driver_name: string;
  driver_rating: number;
  driver_car: string;
  passenger_name: string;
  passenger_phone: string;
  created_at: string;
}

const CITIES = ["Москва", "Санкт-Петербург", "Казань", "Нижний Новгород", "Екатеринбург", "Самара", "Уфа", "Краснодар", "Воронеж", "Ярославль", "Тверь"];

const MOCK_ROUTES = [
  { from: "Москва", to: "Санкт-Петербург", distance: "714 км", duration: "~8 ч", price: "от 7 500 ₽", popular: true },
  { from: "Москва", to: "Нижний Новгород", distance: "411 км", duration: "~5 ч", price: "от 4 200 ₽", popular: true },
  { from: "Москва", to: "Казань", distance: "820 км", duration: "~9 ч", price: "от 8 000 ₽", popular: false },
  { from: "Москва", to: "Краснодар", distance: "1350 км", duration: "~14 ч", price: "от 12 500 ₽", popular: false },
  { from: "Санкт-Петербург", to: "Москва", distance: "714 км", duration: "~8 ч", price: "от 7 500 ₽", popular: true },
  { from: "Екатеринбург", to: "Челябинск", distance: "210 км", duration: "~2.5 ч", price: "от 2 200 ₽", popular: false },
];

const MOCK_REVIEWS = [
  { name: "Марина Л.", rating: 5, text: "Водитель приехал вовремя, машина чистая. Очень комфортная поездка до Питера!", date: "12 марта 2026" },
  { name: "Игорь В.", rating: 4, text: "Всё хорошо, но немного опоздали на 10 минут. В целом рекомендую.", date: "9 марта 2026" },
  { name: "Светлана К.", rating: 5, text: "Отличный сервис! Уже 4-й раз езжу, всегда на высшем уровне.", date: "5 марта 2026" },
];

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.floor(value) ? "star-filled text-sm" : "text-sm text-white/20"}>★</span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    upcoming: { label: "Предстоит", cls: "bg-neon-yellow/15 text-neon-yellow border border-neon-yellow/30" },
    done: { label: "Завершён", cls: "bg-white/5 text-white/50 border border-white/10" },
    cancelled: { label: "Отменён", cls: "bg-red-500/15 text-red-400 border border-red-500/20" },
  };
  const s = map[status] || map.done;
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

function HomePage({ onBook }: { onBook: () => void }) {
  return (
    <div className="pb-6">
      <div className="relative px-4 pt-10 pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-neon-yellow/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-neon-cyan/5 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-4 text-xs text-white/60 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            Доступно 24/7 по всей России
          </div>
          <h1 className="text-4xl font-black leading-tight mb-3 animate-fade-in delay-1">
            Такси<br /><span className="gradient-text">межгород</span><br />без хлопот
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-6 animate-fade-in delay-2">
            Предварительный заказ за 1 минуту.<br />Проверенные водители и фиксированная цена.
          </p>
          <button onClick={onBook} className="btn-neon w-full rounded-2xl py-4 text-base font-bold animate-fade-in delay-3 pulse-neon">
            Заказать поездку →
          </button>
        </div>
      </div>

      <div className="px-4 grid grid-cols-3 gap-3 mb-6 animate-fade-in delay-3">
        {[
          { val: "850+", label: "Маршрутов" },
          { val: "4.9", label: "Рейтинг" },
          { val: "50к+", label: "Поездок" },
        ].map((s) => (
          <div key={s.val} className="glass rounded-2xl p-3 text-center card-hover">
            <div className="text-2xl font-black neon-yellow">{s.val}</div>
            <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">Популярные маршруты</h2>
        <div className="space-y-2">
          {MOCK_ROUTES.filter(r => r.popular).map((r, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center justify-between card-hover cursor-pointer" onClick={onBook}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neon-yellow/10 flex items-center justify-center">
                  <Icon name="MapPin" size={16} className="text-neon-yellow" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.from} → {r.to}</div>
                  <div className="text-xs text-white/40">{r.distance} · {r.duration}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold neon-yellow">{r.price}</div>
                <Icon name="ChevronRight" size={14} className="text-white/30 ml-auto mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-lg font-bold mb-3">Отзывы пассажиров</h2>
        <div className="space-y-3">
          {MOCK_REVIEWS.map((r, i) => (
            <div key={i} className="glass rounded-2xl p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-yellow/30 to-neon-cyan/30 flex items-center justify-center text-xs font-bold">
                    {r.name[0]}
                  </div>
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <StarRating value={r.rating} />
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{r.text}</p>
              <p className="text-xs text-white/30 mt-2">{r.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingPage({ onOrderCreated }: { onOrderCreated: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ from: "", to: "", date: "", time: "", passengers: "1", comment: "" });
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const submitOrder = async () => {
    setLoading(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city_from: form.from,
        city_to: form.to,
        trip_date: form.date,
        trip_time: form.time,
        passengers: parseInt(form.passengers),
        comment: form.comment,
      }),
    });
    const data = await res.json();
    setCreatedOrder(data.order);
    setLoading(false);
    setStep(4);
    onOrderCreated();
  };

  const inputCls = "w-full glass rounded-xl px-4 py-3.5 text-sm outline-none transition-all text-white placeholder:text-white/30 border border-white/5 focus:border-neon-yellow/40 bg-transparent";
  const labelCls = "block text-xs text-white/40 mb-1.5 font-medium";

  return (
    <div className="px-4 pb-6 pt-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Новый заказ</h1>
      <p className="text-white/40 text-sm mb-6">Заполните маршрут и время поездки</p>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= s ? "bg-neon-yellow" : "bg-white/10"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="font-bold text-lg">Маршрут</h2>
          <div className="glass rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-neon-yellow" />
                <div className="w-0.5 h-8 route-line" />
                <div className="w-3 h-3 rounded-full bg-neon-cyan" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className={labelCls}>Откуда</label>
                  <select value={form.from} onChange={e => update("from", e.target.value)} className={inputCls + " appearance-none"}>
                    <option value="" className="bg-[#0F1320]">Выберите город отправления</option>
                    {CITIES.map(c => <option key={c} value={c} className="bg-[#0F1320]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Куда</label>
                  <select value={form.to} onChange={e => update("to", e.target.value)} className={inputCls + " appearance-none"}>
                    <option value="" className="bg-[#0F1320]">Выберите город назначения</option>
                    {CITIES.map(c => <option key={c} value={c} className="bg-[#0F1320]">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setStep(2)} disabled={!form.from || !form.to} className="btn-neon w-full rounded-2xl py-4 font-bold disabled:opacity-30 disabled:cursor-not-allowed">
            Далее →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="font-bold text-lg">Дата и время</h2>
          <div className="glass rounded-2xl p-4 space-y-4">
            <div>
              <label className={labelCls}>Дата поездки</label>
              <input type="date" value={form.date} onChange={e => update("date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Время отправления</label>
              <input type="time" value={form.time} onChange={e => update("time", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Пассажиров</label>
              <div className="flex gap-2">
                {["1", "2", "3", "4"].map(n => (
                  <button key={n} onClick={() => update("passengers", n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${form.passengers === n ? "bg-neon-yellow text-black" : "glass text-white/60 hover:text-white"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost-neon flex-none rounded-2xl px-5 py-4 font-bold">←</button>
            <button onClick={() => setStep(3)} disabled={!form.date || !form.time} className="btn-neon flex-1 rounded-2xl py-4 font-bold disabled:opacity-30">
              Далее →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="font-bold text-lg">Подтверждение</h2>
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Маршрут</span>
              <span className="font-semibold">{form.from} → {form.to}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Дата</span>
              <span className="font-semibold">{form.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Время</span>
              <span className="font-semibold">{form.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Пассажиров</span>
              <span className="font-semibold">{form.passengers}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Стоимость</span>
              <span className="font-black neon-yellow text-base">~4 800 ₽</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Комментарий для водителя (опционально)</label>
            <textarea
              value={form.comment}
              onChange={e => update("comment", e.target.value)}
              placeholder="Багаж, детское кресло, особые пожелания..."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost-neon flex-none rounded-2xl px-5 py-4 font-bold">←</button>
            <button onClick={submitOrder} disabled={loading} className="btn-neon flex-1 rounded-2xl py-4 font-bold disabled:opacity-50">
              {loading ? "Оформляем..." : "Подтвердить заказ ✓"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && createdOrder && (
        <div className="text-center py-10 animate-scale-in">
          <div className="w-24 h-24 rounded-full glass-bright flex items-center justify-center mx-auto mb-6 pulse-neon">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-black mb-2">Заказ принят!</h2>
          <p className="text-white/50 text-sm mb-2">Номер заказа: <span className="neon-yellow font-bold">{createdOrder.order_number}</span></p>
          <p className="text-white/40 text-xs mb-2">Водитель: <span className="text-white/70">{createdOrder.driver_name}</span></p>
          <p className="text-white/40 text-xs mb-8">{createdOrder.driver_car}</p>
          <button onClick={() => { setStep(1); setCreatedOrder(null); setForm({ from: "", to: "", date: "", time: "", passengers: "1", comment: "" }); }} className="btn-ghost-neon rounded-2xl px-8 py-3.5 font-bold">
            Новый заказ
          </button>
        </div>
      )}
    </div>
  );
}

function OrdersPage({ refresh }: { refresh: number }) {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders, refresh]);

  const active = orders.filter(o => o.status === "upcoming");
  const history = orders.filter(o => o.status !== "upcoming");
  const list = tab === "active" ? active : history;

  const formatDate = (d: string, t: string) => `${d} в ${t}`;

  return (
    <div className="px-4 pb-6 pt-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Мои заказы</h1>
      <p className="text-white/40 text-sm mb-5">История и предстоящие поездки</p>

      <div className="glass rounded-2xl p-1 flex mb-5">
        {(["active", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === t ? "bg-neon-yellow text-black" : "text-white/40"}`}>
            {t === "active" ? `Активные (${active.length})` : `История (${history.length})`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 text-white/30">
          <div className="w-8 h-8 border-2 border-neon-yellow/30 border-t-neon-yellow rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Загрузка...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {list.map((o, i) => (
            <div key={o.id} className="glass rounded-2xl p-4 card-hover animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/30 font-mono">{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="font-bold">{o.city_from} → {o.city_to}</div>
                </div>
                <div className="font-black neon-yellow">{o.price.toLocaleString("ru")} ₽</div>
              </div>
              <div className="flex items-center gap-2 mb-3 text-xs text-white/40">
                <Icon name="Calendar" size={12} />
                <span>{formatDate(o.trip_date, o.trip_time)}</span>
                <span className="text-white/20">·</span>
                <Icon name="Users" size={12} />
                <span>{o.passengers} пасс.</span>
              </div>
              {o.driver_name && (
                <>
                  <div className="h-px bg-white/5 mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-yellow/20 to-neon-cyan/20 flex items-center justify-center text-xs font-bold">
                        {o.driver_name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{o.driver_name}</div>
                        <div className="text-xs text-white/30">{o.driver_car}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarRating value={o.driver_rating} />
                      <span className="text-xs text-white/40 ml-1">{o.driver_rating}</span>
                    </div>
                  </div>
                </>
              )}
              {o.status === "upcoming" && (
                <button className="btn-ghost-neon w-full mt-3 rounded-xl py-2.5 text-sm font-bold">
                  Позвонить водителю
                </button>
              )}
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Icon name="PackageOpen" size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Нет заказов</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoutesPage({ onBook }: { onBook: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = MOCK_ROUTES.filter(r =>
    r.from.toLowerCase().includes(search.toLowerCase()) ||
    r.to.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pb-6 pt-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Маршруты</h1>
      <p className="text-white/40 text-sm mb-5">Все направления межгорода</p>

      <div className="relative mb-5">
        <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск города..."
          className="w-full glass rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border border-white/5 focus:border-neon-yellow/40 transition-all text-white placeholder:text-white/30 bg-transparent"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((r, i) => (
          <div key={i} onClick={onBook} className="glass rounded-2xl p-4 cursor-pointer card-hover animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1 py-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-neon-yellow" />
                <div className="w-0.5 h-5 bg-gradient-to-b from-neon-yellow to-neon-cyan" />
                <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{r.from}</div>
                <div className="font-bold text-sm">{r.to}</div>
              </div>
              <div className="text-right">
                <div className="font-black neon-yellow text-sm">{r.price}</div>
                <div className="text-xs text-white/30">{r.duration}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Icon name="Route" size={11} />
                {r.distance}
              </span>
              {r.popular && (
                <span className="text-xs bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20 px-2 py-0.5 rounded-full">
                  Популярный
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="pb-6 pt-4 animate-fade-in">
      <div className="px-4 mb-6">
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-yellow/40 to-neon-cyan/30 flex items-center justify-center text-2xl font-black">
            АИ
          </div>
          <div className="flex-1">
            <div className="font-black text-lg">Александр Иванов</div>
            <div className="text-sm text-white/40">+7 (916) 123-45-67</div>
            <div className="flex items-center gap-1 mt-1">
              <StarRating value={5} />
              <span className="text-xs text-white/40 ml-1">Пассажир</span>
            </div>
          </div>
          <button className="btn-ghost-neon rounded-xl p-2.5">
            <Icon name="Pencil" size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        {[
          { val: "23", label: "Поездки", icon: "Car" },
          { val: "4.9", label: "Рейтинг", icon: "Star" },
          { val: "54к", label: "Км пути", icon: "Map" },
        ].map(s => (
          <div key={s.val} className="glass rounded-2xl p-3 text-center card-hover">
            <Icon name={s.icon} size={18} className="text-neon-yellow mx-auto mb-1" />
            <div className="text-xl font-black">{s.val}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {[
          { icon: "CreditCard", label: "Способы оплаты", hint: "Карта •••• 1234" },
          { icon: "Bell", label: "Уведомления", hint: "Включены" },
          { icon: "Shield", label: "Безопасность", hint: "" },
          { icon: "Gift", label: "Промокоды", hint: "0 активных" },
          { icon: "HelpCircle", label: "Помощь", hint: "" },
        ].map((item) => (
          <button key={item.label} className="w-full glass rounded-2xl px-4 py-3.5 flex items-center gap-3 card-hover text-left">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <Icon name={item.icon} size={16} className="text-neon-yellow" />
            </div>
            <span className="flex-1 font-medium text-sm">{item.label}</span>
            {item.hint && <span className="text-xs text-white/30">{item.hint}</span>}
            <Icon name="ChevronRight" size={14} className="text-white/20" />
          </button>
        ))}
        <button className="w-full glass rounded-2xl px-4 py-3.5 flex items-center gap-3 card-hover text-left border border-red-500/10">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Icon name="LogOut" size={16} className="text-red-400" />
          </div>
          <span className="flex-1 font-medium text-sm text-red-400">Выйти</span>
        </button>
      </div>
    </div>
  );
}

function SupportPage() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faq = [
    { q: "Как отменить заказ?", a: "Отменить заказ можно в разделе «Мои заказы» до момента подачи автомобиля. При отмене менее чем за 1 час взимается комиссия 10%." },
    { q: "Как изменить время поездки?", a: "Свяжитесь с поддержкой или позвоните водителю напрямую через приложение. Изменение возможно не менее чем за 2 часа до поездки." },
    { q: "Что включено в стоимость?", a: "Стоимость включает поездку до пункта назначения, одно место для обычного багажа. Крупногабаритный груз оговаривается отдельно." },
    { q: "Как оставить отзыв о водителе?", a: "После завершения поездки в разделе «Мои заказы» появится кнопка «Оценить поездку»." },
  ];

  return (
    <div className="px-4 pb-6 pt-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Поддержка</h1>
      <p className="text-white/40 text-sm mb-5">Помогаем 24/7</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: "Phone", label: "Позвонить", hint: "8-800-555-01-01", color: "text-neon-green" },
          { icon: "MessageCircle", label: "Написать", hint: "Telegram", color: "text-neon-cyan" },
        ].map(c => (
          <button key={c.label} className="glass rounded-2xl p-4 text-center card-hover">
            <Icon name={c.icon} size={24} className={`${c.color} mx-auto mb-2`} />
            <div className="font-bold text-sm">{c.label}</div>
            <div className="text-xs text-white/30 mt-0.5">{c.hint}</div>
          </button>
        ))}
      </div>

      <h2 className="font-bold text-base mb-3">Частые вопросы</h2>
      <div className="space-y-2 mb-6">
        {faq.map((item, i) => (
          <div key={i} className="glass rounded-2xl overflow-hidden">
            <button className="w-full px-4 py-3.5 flex items-center justify-between text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span className="text-sm font-medium">{item.q}</span>
              <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} size={16} className="text-white/30 flex-shrink-0 ml-2" />
            </button>
            {openFaq === i && (
              <div className="px-4 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="font-bold text-base mb-3">Написать в поддержку</h2>
      {sent ? (
        <div className="glass rounded-2xl p-6 text-center animate-scale-in">
          <div className="text-3xl mb-3">✓</div>
          <div className="font-bold mb-1">Сообщение отправлено</div>
          <div className="text-sm text-white/40">Ответим в течение 15 минут</div>
          <button onClick={() => setSent(false)} className="btn-ghost-neon rounded-xl px-6 py-2.5 text-sm font-bold mt-4">Новое сообщение</button>
        </div>
      ) : (
        <div className="glass rounded-2xl p-4 space-y-3">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Опишите вашу проблему подробно..."
            rows={4}
            className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/30 resize-none"
          />
          <button onClick={() => message && setSent(true)} disabled={!message} className="btn-neon w-full rounded-xl py-3 text-sm font-bold disabled:opacity-30">
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [ordersRefresh, setOrdersRefresh] = useState(0);

  const nav = [
    { id: "home" as Page, icon: "Home", label: "Главная" },
    { id: "booking" as Page, icon: "Plus", label: "Заказ" },
    { id: "orders" as Page, icon: "Receipt", label: "Заказы" },
    { id: "routes" as Page, icon: "Map", label: "Маршруты" },
    { id: "profile" as Page, icon: "User", label: "Профиль" },
    { id: "support" as Page, icon: "LifeBuoy", label: "Помощь" },
  ];

  const goBooking = () => setPage("booking");
  const onOrderCreated = () => setOrdersRefresh(r => r + 1);

  return (
    <div className="min-h-screen bg-[var(--deep-bg)] flex flex-col max-w-md mx-auto">
      <header className="glass border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-yellow to-orange-500 flex items-center justify-center">
            <Icon name="Car" size={16} className="text-black" />
          </div>
          <span className="font-black text-base gradient-text">МежГород</span>
        </div>
        <button className="relative">
          <Icon name="Bell" size={20} className="text-white/50" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-neon-yellow" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {page === "home" && <HomePage onBook={goBooking} />}
        {page === "booking" && <BookingPage onOrderCreated={onOrderCreated} />}
        {page === "orders" && <OrdersPage refresh={ordersRefresh} />}
        {page === "routes" && <RoutesPage onBook={goBooking} />}
        {page === "profile" && <ProfilePage />}
        {page === "support" && <SupportPage />}
      </main>

      <nav className="glass border-t border-white/5 px-2 py-2 sticky bottom-0 z-50">
        <div className="flex">
          {nav.map(({ id, icon, label }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-200 ${active ? "nav-active" : "text-white/30 hover:text-white/60"}`}
              >
                <div className={`nav-icon-wrap w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${active ? "bg-neon-yellow/15" : ""}`}>
                  <Icon name={icon} size={18} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}