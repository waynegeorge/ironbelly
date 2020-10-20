import { Epic, combineEpics, ofType } from 'redux-observable'
import {
  filter,
  ignoreElements,
  catchError,
  mergeMap,
  tap,
} from 'rxjs/operators'
import RNFS from 'react-native-fs'
import { Action, Slate, State as RootState } from 'src/common/types'
import { getNavigation } from 'src/modules/navigation'
import { getStateForRust, isResponseSlate } from 'src/common'
import { of, partition, merge } from 'rxjs'
import { log } from 'src/common/logger'
// @ts-ignore
import { NativeModules } from 'react-native'

const { GrinBridge } = NativeModules

export type State = {
  unopenedSlatePath: string
  legalAccepted: boolean
}
export const initialState: State = {
  unopenedSlatePath: '',
  legalAccepted: false,
}

export const appReducer = (
  state: State = initialState,
  action: Action,
): State => {
  switch (action.type) {
    case 'SLATE_LOAD_REQUEST':
      return {
        ...state,
        unopenedSlatePath: action.slatePath,
      }
    case 'SLATE_LOAD_SUCCESS':
      return {
        ...state,
        unopenedSlatePath: '',
      }
    case 'ACCEPT_LEGAL':
      return {
        ...state,
        legalAccepted: action.value,
      }
    default:
      return state
  }
}

export const handleOpenSlateEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType('VALID_PASSWORD', 'SLATE_LOAD_REQUEST'),
    filter(
      () =>
        !!state$.value.app.unopenedSlatePath &&
        state$.value.wallet.password.valid,
    ),
    mergeMap(async () => {
      const slatepack: string = await RNFS.readFile(
        state$.value.app.unopenedSlatePath,
        'utf8',
      )
      const slate: Slate = await GrinBridge.slatepackDecode(
        getStateForRust(state$.value),
        slatepack,
      ).then((json: string) => JSON.parse(json))
      return {
        type: 'SLATE_LOAD_SUCCESS',
        slatepack,
        slate,
        slatePath: state$.value.app.unopenedSlatePath,
      } as Action
    }),
    catchError((error) => {
      log(error, true)
      return of({
        type: 'SLATE_SET_FAILURE',
        code: 1,
        message: error.message,
      } as Action)
    }),
  )

export const handleOpenedSlateEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) => {
  const [response$, request$] = partition(
    action$.pipe(
      filter(({ type }) => type === 'SLATE_LOAD_SUCCESS'),
      mergeMap(async (action) => {
        // @ts-ignore
        const { slate } = action
        const isResponse = await isResponseSlate(slate)
        return { ...action, isResponse }
      }),
    ),
    ({ isResponse }) => isResponse,
  )
  const combined$ = merge(
    request$.pipe(
      // @ts-ignore
      tap(async ({ slatepack }) => {
        const navigation = await getNavigation()
        navigation?.navigate('TxIncompleteReceive', { slatepack })
      }),
      ignoreElements(),
    ),
    response$.pipe(
      // @ts-ignore
      tap(async ({ slate, slatepack }) => {
        const navigation = await getNavigation()
        const tx = state$.value.tx.list.data.find(
          (tx) => tx.slateId === slate.id,
        )
        navigation?.navigate('TxIncompleteSend', { tx, slatepack })
      }),
      ignoreElements(),
    ),
  )

  return combined$
}

const checkBiometryEpic: Epic<Action, Action, RootState> = () => {
  return of({
    type: 'CHECK_BIOMETRY_REQUEST',
  })
}

export const appEpic: Epic<Action, Action, RootState> = combineEpics(
  checkBiometryEpic,
  handleOpenSlateEpic,
  handleOpenedSlateEpic,
)
