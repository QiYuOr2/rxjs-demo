// 来自： https://github.com/vuejs/vue-rx/issues/120#issuecomment-606879136
import { onBeforeUnmount, Ref, ref } from "vue";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

function subscribeTo<T>(
  observable: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void
) {
  const unsubscrible$ = new Subject<void>();
  const subscription = observable
    .pipe(takeUntil(unsubscrible$))
    .subscribe({ next, error, complete });

  onBeforeUnmount(() => {
    unsubscrible$.next();
    unsubscrible$.complete();
  });

  return subscription;
}

export function useObservable<T>(observable: Observable<T>, defaultValue?: T) {
  const handler = ref(defaultValue) as Ref<T>;
  subscribeTo(
    observable,
    (value) => {
      handler.value = value;
    },
    (error) => {
      throw error;
    }
  );

  return handler;
}

export function useSubscription<T>(
  observable: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void
) {
  return subscribeTo(observable, next, error, complete);
}

export function useDOMEvent() {
  const subject = new Subject();
  return {
    subject,
    callback: (event: Event) => {
      subject.next(event);
    },
  };
}
