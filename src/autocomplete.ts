import { getLastIndex } from "./strings"

export interface CompletionState {
    tabNameIndex: number,
    /*
        tabAppendLen

        number of characters we appended after @
        when pressing tab.

        The same amount will be wiped on next tab press
        to iterate names.
    */
    tabAppendLen: number,
    isAutocompleteTabbing: boolean,
}

const completionStates: Record<string, CompletionState> = {}

/**
 * generic autocompletion for input fields
 *
 * example:
 *
 * messageInp.addEventListener('keydown', (event: KeyboardEvent) => {
 *   autoComplete('/', ["help", "info"], event, document.querySelector('input'))
 * })
 *
 * Will autocomplete help and info when typed / and pressing tab
 *
 *
 * @param prefix triggers the completion for example !, @, :, /
 * @param completions array of items to complete for example ["help", "info"]
 * @param event KeyboardEvent such as keydown or keyup
 * @param inputField HTMLInputElement where the input is coming from and where the completion will be applied
 * @returns
 */
export const autoComplete = (prefix: string, completions: string[], event: KeyboardEvent, inputField: HTMLInputElement) => {
    const end: number = inputField.value.length
    const compState: CompletionState = completionStates[prefix] || {
        tabNameIndex: 0,
        tabAppendLen: 0,
        isAutocompleteTabbing: false
    }
    completionStates[prefix] = compState
    // tab complete when typed the prefix and hitting tab
    if (event.key === 'Tab') {
        event.preventDefault()

        if(completions.length === 0) {
            console.log(`warning tried to complete empty list. prefix=${prefix}`)
            return
        }

        // start tabbing with empty prefix
        if (inputField.value[end - 1] === prefix || compState.isAutocompleteTabbing) {
            const completedName: string = completions[compState.tabNameIndex % completions.length]
            if (compState.tabAppendLen !== 0) {
                const choppedComplete = inputField.value.substring(0, inputField.value.length - (compState.tabAppendLen - 0))
                inputField.value = choppedComplete
            }
            inputField.value += completedName
            compState.tabNameIndex++
            compState.tabAppendLen = completedName.length
            compState.isAutocompleteTabbing = true
            return
        }
        // continue tabbing when already typed a name
        const atIndex = getLastIndex(inputField.value, prefix)
        if (atIndex !== -1) {
            const currentCompletion = inputField.value.substring(atIndex + 1)
            if (currentCompletion.indexOf(' ') !== -1) {
                // do not continue tab completing if there is a space
                return
            }
            if (!currentCompletion &&
                    currentCompletion.length === 0 &&
                    currentCompletion.length < 16) {
                return
            }
            const matchingNames = completions.filter((name: string) => {
                return name.toLowerCase().startsWith(currentCompletion.toLowerCase())
            })
            if (matchingNames.length < 1) {
                return
            }
            inputField.value =
                inputField.value.substring(0, atIndex + 1) +
                matchingNames[compState.tabNameIndex % matchingNames.length]
        }
    } else {
        // pressing any key other than tab
        // ends the tabbing mode
        compState.isAutocompleteTabbing = false
        compState.tabAppendLen = 0
    }
}
