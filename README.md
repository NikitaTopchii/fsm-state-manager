
# State Transition Manager

> A simple, flexible and strongly-typed finite state machine manager for managing state transitions in Angular or any TypeScript-based application.

---

# Latest Updates

> v1.1.2 — State Subscriptions Added, Error Handling Improved, and Subscription Mode Toggle Introduced

---

## 🌐 Table of Contents

- [What is a State](#what-is-a-state)
- [What is an Event](#what-is-an-event)
- [What is a Transition](#what-is-a-transition)
- [What are Transition Rules](#what-are-transition-rules)
- [What is FSM Config](#what-is-fsm-config)
- [What is Transition Guard](#what-is-transition-guard)
- [What are Options](#what-are-options)
- [Example of Transition Rules for HTTP Requests](#example-of-transition-rules-for-http-requests)

---

## 🧠 What is a State

In this implementation, a **state** represents the current phase of an action the user is performing. This could be processing an HTTP request or the status of a filter the user has opened.

### Example:

```ts
type HttpRequestStateType = 'init' | 'loading' | 'loaded' | 'error';

const initialState = {
  state: 'init',
  appliedData: [],
};
```

Each state describes a phase of your application logic — e.g., "loading" during a data fetch or "error" when something goes wrong.

---

## ⚡ What is an Event

An **event** is an action that triggers a state change.
Thanks to events, we can precisely control **transitions** between states via defined transition rules.

For example, consider an HTTP request. The initial state before the user clicks a button might be init. When the user clicks the button, an event like fetch is triggered, transitioning to the loading state — because from init, we can only go to loading. Then from loading, we can go to either loaded or error, depending on the outcome (success or failure events).

### Example:

```ts
type HttpRequestEventType = 'fetch' | 'success' | 'failure' | 'retry';
```

Events are mapped to states, and when fired, they initiate a transition based on defined rules.

---

## 🔁 What is a Transition

**Transitions** define how we move from one state to another, triggered by events.
Transitions are controlled by a transition function. For better type safety and consistency, it’s recommended to define a reusable type for them.

The function takes two arguments: the **current state** (including any data), and an **optional payload** used to shape the next state.

### Transition Function Signature

```ts
type TransitionBaseStateFn<Config extends FSMConfigI> = (
    data: StateDataI<Config>,
    payload?: { appliedData?: Config['data'] } 
  ) => StateDataI<Config>;
```

---

## 🧾 What are Transition Rules

**Transition rules** define how the state machine should **transition** between states when specific events occur.
If an event happens in a certain state and there's a matching transition rule for it, the rule is executed.

### Type Definition

```ts
type TransitionRulesType<Config extends FSMConfigI> = {
  [State in Config['state']]: Partial<Record<Config['event'], TransitionRule<Config>>>;
};
```

---

## 🧾 What is FSM Config

**FSMConfig** is the interface that defines the configuration for a particular implementation of the state manager. For instance, a state manager for HTTP requests will have a different config than one managing filter state.

### Type Definition

```ts
interface HttpRequestFSMConfigI extends FSMConfigI{
    state: HttpRequestStateType,
    event: HttpRequestEventType,
    rule: TransitionHttpRequestStateFn<HttpRequestFSMConfigI>, 
    data: any // data type coming from the backend
}

export default HttpRequestFSMConfigI;
```

---

## 🧾 What is Transition Guard

A **TransitionGuard** is a function that prevents a state change based on some condition.
It’s useful for scenarios like preventing unauthenticated users from transitioning or validating a state or event before a transition occurs.

### Type Definition

```ts
type TransitionGuardFn<Config extends FSMConfigI> = (
    currentState?: Config['state'],
    event?: Config['event'],
) => boolean;
```

### Use Case

```ts
success: {
  transitionAction: (data: any, payload: any) =>
    payload?.appliedData
      ? { state: 'loaded', appliedData: payload.appliedData }
      : data,
  transitionGuard: () => doSomething(), // some function returning a boolean
}
```

---

## 🧾 What are Options

**Options** are additional settings that can be optionally passed when creating a state manager instance.
They allow enabling devMode or logging transitions. By default, both are set to false.

### Definition

```ts
new StateManagerFSM(HttpRequestTransitionRules, { devMode: true, logTransitions: true });
```

---

## What is transition

The **transition** method is the core feature that performs state changes based on transition rules.
It does several safety checks and ensures the transition is valid. When devMode or logTransitions are enabled, it also logs state transitions to the console.

### Definition

```ts
stateManager.transition('fetch');

stateManager.transition('success', ['data1', 'data2']);
```

---

## What is canTransition

**canTransition** is a public method that checks if a transition from the current state is possible using a specific event.

### Definition

```ts
stateManager.canTransition('failure');
```

---

## What are setStateData and getStateData

**setStateData** is a setter method for initializing or overriding the current state.
**getStateData** is a getter method to retrieve the current state data.

### Definition

```ts
stateManager.setStateData({ state: 'init', appliedData: [] });

stateManager.getStateData(); // { state: 'init', appliedData: [] }
```

---

## Subscription on changing state

You can subscribe to a specific state change and pass a function that will be triggered when the transition to the desired state occurs.
This can be useful for displaying loading notifications, error messages, or any other scenarios — the only limit is your imagination.
To subscribe, simply call the **subscribe** method on the state manager, passing two arguments: the first is the state you want to listen to, and the second is the callback function that should execute when the state changes.
To unsubscribe, refer to the variable where you stored the subscription and call the **unsubscribe** method on it.

This is optional with **subscriptionMode**.

```ts
const stateManager = new StateManagerFSM<Config>(transitionRules, { subscriptionMode: true })

const subscribtion = stateManager.subscribe('loaded', () => {})

benchmarkTransition('fetch');
benchmarkTransition('success', ['data1', 'data2']);

subscribtion.unsubscribe();

benchmarkTransition('fetch');
benchmarkTransition('success', ['data1', 'data2']);
```
---

## 📦 Example of Transition Rules for HTTP Requests

Here’s a complete example that demonstrates how you could define transition rules for managing the lifecycle of an HTTP request:

```ts
const HttpRequestTransitionRules: TransitionRulesType<HttpRequestFSMConfigI> = {
  init: {
    fetch: {
      transitionAction: () => ({
        state: 'loading',
        appliedData: [],
      }),
    },
  },
  loading: {
    success: {
      transitionAction: (data: any, payload: any) =>
        payload?.appliedData
          ? { state: 'loaded', appliedData: payload.appliedData }
          : data,
      transitionGuard: () => doSomething(),
    },
    failure: {
      transitionAction: (data: any, payload: any) =>
        payload?.appliedData
          ? { state: 'error', appliedData: payload.appliedData }
          : data,
    },
  },
  loaded: {
    fetch: {
      transitionAction: () => ({
        state: 'loading',
        appliedData: [],
      }),
    },
  },
  error: {
    retry: {
      transitionAction: () => ({
        state: 'loading',
        appliedData: [],
      }),
    },
  },
};
```

Each transition function returns either a new state or the current one (if unchanged).
This makes the state machine predictable, easy to test, and highly reusable.

---

## Use case 

```ts
type HttpRequestStateType = 'init' | 'loading' | 'loaded' | 'error';

type HttpRequestEventType = 'fetch' | 'success' | 'failure' | 'retry';

type TransitionHttpRequestStateFn<Config extends HttpRequestFSMConfigI> = (
  data: Config['data'],
  payload?: { appliedData?: Config['data'] }
) => Config['data'];

interface HttpRequestFSMConfigI extends FSMConfigI {
  state: HttpRequestStateType,
  event: HttpRequestEventType,
  rule: TransitionHttpRequestStateFn<HttpRequestFSMConfigI>,
  data: any
}

const stateManager = new StateManagerFSM(HttpRequestTransitionRules, { devMode: true, logTransitions: true });

stateManager.setStateData({ state: 'init', appliedData: [] });

stateManager.transition('fetch'); 
// [FSM] Transition: 'init' state → 'loading' state triggered by 'fetch' event

stateManager.transition('success', ['data1', 'data2']); 
// [FSM] Transition: 'loading' state → 'loaded' state triggered by 'success' event

console.log(stateManager.canTransition('failure')); 
// [FSM Warn] We can't transition to another state with event 'failure' from state 'loaded' → false

console.log(stateManager.getStateData().appliedData); 
// ['data1', 'dota2']
```

---

## Трішки про швидкість

Переходи між стейтами відбуваються майже миттево, завдяки цьому ви можете швидше маніпулювати даними та UI вашого застосунку що буде утримувати користувачів залишатися разом з вами

```ts
2518.5655ms
[FSM] Transition: 'init' state → 'loading' state triggered by 'fetch' event
[FSM Benchmark] Transition for event 'fetch' took 0.1023ms
[FSM] Transition: 'loading' state → 'loaded' state triggered by 'success' event
[FSM Benchmark] Transition for event 'success' took 0.0898ms
[FSM] Transition: 'loaded' state → 'loading' state triggered by 'fetch' event
[FSM Benchmark] Transition for event 'fetch' took 0.3693ms
[FSM] Transition: 'loading' state → 'loaded' state triggered by 'success' event
[FSM Benchmark] Transition for event 'success' took 0.0184ms
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

## 🔁 Що таке переходи

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
  [State in Config['state']]: Partial<Record<Config['event'], TransitionRule<Config>>>;
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

## Що таке TransitionsGuard 

**TransitionsGuardd** це тип функції, який дозволяє нам не дати перейти на інший стейт за якоїсь умови, наприклад за відсутності авторизації у користувача, або при умові невалідного івенту або стану. Це дає нам більш гнучко налаштовувати наші переходи між станами, та навіть при валідному правилі переходу не дати це зробити (перехід).

### Type Definition

```ts
type TransitionGuardFn<Config extends FSMConfigI> = (
    currentState?: Config['state'],
    event?: Config['event'],
) => boolean

export default HttpRequestFSMConfigI;
```

### Use case

```ts
      success: {
        transitionAction: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'loaded', appliedData: payload.appliedData }
              : data,
        transitionGuard: () => doSomething(), // якась функція що повертає boolean 
      },
```

---

## Що таке options

**options** це додаткові налаштування, які ми можемо опціонально вмикати/вимикати в нашому стейт менеджері, прокидуючи в конструктор обʼєкт з двома полями. Поле devMode та поле logTransition. За замовчуванням їх треба ставити false, якщо вам не треба логування, або попереджувальні логи.

### Definition

```ts
  new StateManagerFSM(HttpRequestTransitionRules, { devMode: true, logTransitions: true });
```
---

## Що таке transition

**transition** це головний метод, який нам дозволяє робити всю магію, та використовуючи правила переходів перемикати стейти. Він робить декілька перевірок для того щоб зробити це коректно та не дасть перейти в стейт якщо івент який ми хочемо виконати не є валідним. Також ми можемо уввімкнути devMode та logMode і при використанні цього методу спостерігати за тим які стейти і як перемикаються.

### Definition

```ts
  stateManager.transition('fetch');

  stateManager.transition('success', ['data1', 'data2']);
```
---

## Що таке canTransition

**canTransition** це public функція самого стейт менеджеру яка перевіряє чи є можливість зробити перехід з поточного стану на той, який ми вкажемо в аргументі цієї функції.

### Definition

```ts
  stateManager.canTransition('failure')
```
---

## Що таке setStateData та GetStateData

**setStateData** та **getStateData** це два методи які є сетером та геттером і дають можливість ініціалізувати поточний стан та отримати значення з поточного стану

### Definition

```ts
  stateManager.setStateData({ state: 'init', appliedData: [] });

  stateManager.getStateData(); // { state: 'init', appliedData: [] }
```
---

## 📦 Правила переходів для HTTP Requests

Підсумуючи все вище зазначене, можна розглянути приклад правил переходу між станами для http запиту:

```ts
const HttpRequestTransitionRules: TransitionRulesType<HttpRequestFSMConfigI> = {
    init: {
      fetch: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
        })
      },
    },
    loading: {
      success: {
        transitionAction: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'loaded', appliedData: payload.appliedData }
              : data,
        transitionGuard: () => doSomething(),
      },
      failure: {
        transitionAction: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'error', appliedData: payload.appliedData }
              : data,
      }
    },
    loaded: {
      fetch: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
    error: {
      retry: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
};
```

Кожна функція повертає новий стан або поточний, якщо змін не відбулося. Це робить автомат передбачуваним, 
який легко тестувати та багаторазово перевикористовувати код. 

---

## Підписки на зміну станів

Ви можете підписатися на зміну конкретного стану й передати туди функцію, яка спрацює в момент переходу до потрібного вам стану.
Це може бути корисно для відображення сповіщень під час завантаження, повідомлень про помилки або будь-яких інших сценаріїв — обмеження тільки у вашій уяві.
Щоб підписатися, достатньо звернутися до стейт-менеджера та викликати метод **subscribe**, передавши в нього два аргументи: перший — це стан, на який потрібно реагувати, другий — функція-колбек, яка виконається під час зміни на цей стан.
Щоб відписатися, зверніться до змінної у яку ви зберегли підписку та використайте метод **unsubscribe**.

Це необовʼязковий фукнціонал, він вимкнений за замовчуванням, для його роботи треба в конструкторі дописати **subscriptionMode: true**

```ts
const stateManager = new StateManagerFSM<Config>(transitionRules, { subscriptionMode: true })

const subscribtion = stateManager.subscribe('loaded', () => {})

benchmarkTransition('fetch');
benchmarkTransition('success', ['data1', 'data2']);

subscribtion.unsubscribe();

benchmarkTransition('fetch');
benchmarkTransition('success', ['data1', 'data2']);
```

---

## Приклад використання

```ts
type HttpRequestStateType = 'init' | 'loading' | 'loaded' | 'error';

type HttpRequestEventType = 'fetch' | 'success' | 'failure' | 'retry';

type TransitionHttpRequestStateFn<Config extends HttpRequestFSMConfigI> = (
    data: Config['data'],
    payload?: { appliedData?: Config['data'] } 
  ) => Config['data'];

interface HttpRequestFSMConfigI extends FSMConfigI{
    state: HttpRequestStateType,
    event: HttpRequestEventType,
    rule: TransitionHttpRequestStateFn<HttpRequestFSMConfigI>, 
    data: any
}

const HttpRequestTransitionRules: TransitionRulesType<HttpRequestFSMConfigI> = {
    init: {
      fetch: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
        })
      },
    },
    loading: {
      success: {
        transitionAction: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'loaded', appliedData: payload.appliedData }
              : data,
        transitionGuard: () => doSomething(),
      },
      failure: {
        transitionAction: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'error', appliedData: payload.appliedData }
              : data,
      }
    },
    loaded: {
      fetch: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
    error: {
      retry: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
  };

const doSomething = () => { return true }

const stateManager = new StateManagerFSM(HttpRequestTransitionRules, { devMode: true, logTransitions: true });

stateManager.setStateData({ state: 'init', appliedData: [] });

stateManager.transition('fetch'); //[FSM] Transition: 'init' state → 'loading' state triggered by 'fetch' event

stateManager.transition('success', ['data1', 'data2']); //[FSM] Transition: 'loading' state → 'loaded' state triggered by 'success' event

console.log(stateManager.canTransition('failure')); //[FSM Warn] We can't transition to another state with event 'failure' from state 'loaded' (false in console.log)

console.log(stateManager.getStateData().appliedData); // ['data1, 'data2']
```

## 📝 License

MIT
