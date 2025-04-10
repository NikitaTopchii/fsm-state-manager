
# State Transition Manager

> A simple, flexible and strongly-typed finite state machine manager for managing state transitions in Angular or any TypeScript-based application.

---

## 🌐 Table of Contents

- [What is a State](#what-is-a-state)
- [What is an Event](#what-is-an-event)
- [What is a Transition](#what-is-a-transition)
- [What are Transition Rules](#what-are-transition-rules)
- [Example of Transition Rules for HTTP Requests](#example-of-transition-rules-for-http-requests)

---

## 🧠 What is a State

A **state** in this implementation represents a distinct condition of a system at a particular moment. It is typically modeled using a union of string literals or enums.

### Example:

```ts
type DataStateType = 'init' | 'loading' | 'loaded' | 'error';

const initialState = {
  state: 'init',
  appliedData: [],
};
```

Each state describes a phase of your application logic — e.g., "loading" during a data fetch or "error" when something goes wrong.

---

## ⚡ What is an Event

An **event** is an external or internal trigger that causes a state transition. It represents an action that may change the state of the application.

### Example:

```ts
type DataEventType = 'fetch' | 'success' | 'failure' | 'retry';
```

Events are mapped to states, and when fired, they initiate a transition based on defined rules.

---

## 🔁 What is a Transition

A **transition** is the result of applying an event to the current state using a defined rule. It’s a function that receives the current state and (optionally) data, and returns a new state.

### Transition Function Signature

```ts
(currentState: IStateData<Config>, payload?: { appliedData?: Config['data'][] }) => IStateData<Config>;
```

---

## 🧾 What are Transition Rules

**Transition rules** define how the state machine behaves when an event occurs in a given state. Each rule is a function that describes how to move from one state to another.

The rules are defined per state and per event. If an event is triggered while in a specific state and a rule for it exists — it will be executed.

### Type Definition

```ts
type TransitionRulesType<Config extends FSMConfig> = {
  [State in Config['state']]: Partial<Record<Config['event'], TransitionFunction<Config>>>;
};
```

---

## 📦 Example of Transition Rules for HTTP Requests

Here’s a complete example that demonstrates how you could define transition rules for managing the lifecycle of an HTTP request:

```ts
const dataTransitionRules: TransitionRulesType<DataFSMConfig> = {
  init: {
    fetch: () => ({
      state: 'loading',
      appliedData: [],
    }),
  },
  loading: {
    success: (data, payload) =>
      payload?.appliedData
        ? { state: 'loaded', appliedData: payload.appliedData }
        : data,
    failure: (data, payload) =>
      payload?.appliedData
        ? { state: 'error', appliedData: payload.appliedData }
        : data,
  },
  loaded: {
    fetch: () => ({
      state: 'loading',
      appliedData: [],
    }),
  },
  error: {
    retry: () => ({
      state: 'loading',
      appliedData: [],
    }),
    fetch: () => ({
      state: 'loading',
      appliedData: [],
    }),
  },
};
```

Each function in the rule returns a new state or reuses the current one. This makes the state machine predictable, easy to test, and highly reusable.

---

Example of Facade for StateManager 

```ts
@Injectable({
  providedIn: 'root'
})
export class DataStateManagerService {
  private loadStates = new Map<string, IStateData<DataFSMConfig>>();

  private stateTransitionManager: StateTransitionManager<DataFSMConfig>;

  constructor() {
    this.stateTransitionManager = new StateTransitionManager<DataFSMConfig>(dataTransitionRules);

    this.initStates();
  }

  private initStates(): void {
    this.loadStates.set('universal_filters', { state: 'init', appliedData: [] });
  }

  public changeLoadState(key: string, event: DataEventType, stateDataPayload?: UniversalFilters[]): void {
    const currentState = this.loadStates.get(key);

    if (!currentState) {
      return;
    }

    this.stateTransitionManager.setStateData(currentState);

    this.stateTransitionManager.transition(event, stateDataPayload);

    this.loadStates.set(key, this.stateTransitionManager.getState());
  }

  public getLoadState(key: string): IStateData<DataFSMConfig> | undefined {
    return this.loadStates.get(key);
  }

  public getLoadedData(filterKey: string): UniversalFilters[] {
    return this.loadStates.get(filterKey)!.appliedData;
  }
}
```

## 🧠 Що таке стейт 

Стейт у цій реалізації відображає поточний **стан** якоїсь дії яку виконує користувач. Це може бути або обробка http запиту, або стан в якому знаходиться фільтр відкритий користувачем.

### Example:

```ts
type HttpRequestStateType = 'init' | 'loading' | 'loaded' | 'error';

const initialState = {
  state: 'init',
  appliedData: [], // гіпотетичні дані які прийдуть з серверу ( або будь які дані які будуть вкладені в стейт )
};
```

---

## ⚡ Що таке івент

Івент це **дія**, яка спричиняє зміну стану. 
Саме завдяки ньому ми можемо чітко переходити між станами завдяки правилам переходу.

Наприклад є у нас запит на бекенд, початковий стан до того як користувач натисне на кнопку буде "init".
Після того як користувач натисне на кнопку то ініт запустить **event**, наприклад fetch, який повертає стейт loading, бо з init
ми можемо перейти тільки у loading. З loading ми можемо перейти у loaded або error ( завдяки як раз таки івентам success або failure відповідно ).

### Example 

```ts
type HttpRequestEventType = 'fetch' | 'success' | 'failure' | 'retry';
```

---

## 🔁 What is a Transition

**Transitions** це як зрозуміло з назви процес переходу з одного стейту в інший враховуючи дію яка відбулась. 
Для переходів треба використовувати **функцію переходу**, під яку бажано використовувати окремий тип для більшої консистентності даних.
Вона використовує два аргумента одним з яких ж інформація про поточний стан ( його стан та можливі дані які він містить ), та не обовʼязковий аргумент payload який є передаваємими даними в новий стейт.

### Transition Function Signature

```ts
type TransitionBaseStateFn<Config extends FSMConfigI> = (
    data: StateDataI<Config>,
    payload?: { appliedData?: Config['data'] } 
  ) => StateDataI<Config>;

export default TransitionBaseStateFn;
```

---

## 🧾 Що таке правила переходів

**Правила переходів** показують машині шляхи, за якими вона повина переключати стейти через івенти ( про які було сказано вище ).
Це дозволяє доволі гнучко налаштовувати ці самі переходи. Якщо під час певного стану відбувається подія і для цієї події існує правило переходу, то воно виконується. 

### Type Definition

```ts
type TransitionRulesType<Config extends FSMConfigI> = {
  [State in Config['state']]: Partial<Record<Config['event'], Config['rule']>>;
};
```

---

## 🧾 Що таке FSMConfig

**FSMConfig** це інтерфейс який визначає конфігурацію для конкретної імплементації стейт менеджера. Якщо це стейт менеджер для обробки запитів, то це одна конфігурація зі своїми типами стейтів, івентів та функцій для переходу, якщо це стейт менеджер для обробки фільтрів, то це ще одна конфігурація.

### Type Definition

```ts
interface HttpRequestFSMConfigI {
    state: HttpRequestStateType,
    event: HttpRequestEventType,
    rule: TransitionHttpRequestStateFn<HttpRequestFSMConfigI>, 
    data: any // тип даних які ловимо з бекенду 
}

export default HttpRequestFSMConfigI;
```

---

## 📦 Правила переходів для HTTP Requests

Підсумуючи все вище зазначене, можна розглянути приклад правил переходу між станами для http запиту:

```ts
const HttpRequestTransitionRules: TransitionRulesType<HttpRequestFSMConfigI> = {
  init: {
    fetch: () => ({
      state: 'loading',
      appliedData: [],
    }),
  },
  loading: {
    success: (data, payload) =>
      payload?.appliedData
        ? { state: 'loaded', appliedData: payload.appliedData }
        : data,
    failure: (data, payload) =>
      payload?.appliedData
        ? { state: 'error', appliedData: payload.appliedData }
        : data,
  },
  loaded: {
    fetch: () => ({
      state: 'loading',
      appliedData: [],
    }),
  },
  error: {
    retry: () => ({
      state: 'loading',
      appliedData: [],
    }),
    fetch: () => ({
      state: 'loading',
      appliedData: [],
    }),
  },
};
```

Кожна функція повертає новий стан або поточний, якщо змін не відбулося. Це робить автомат передбачуваним, 
який легко тестувати та багаторазово перевикористовувати код. 

## 📝 License

MIT
