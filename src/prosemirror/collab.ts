import { Step } from 'prosemirror-transform'
import { Node } from 'prosemirror-model'

export default class Authority {
  private doc: Node | null | undefined
  private steps: Step[]
  private stepClientIDs: string[]
  private onNewSteps

  constructor(doc?: Node) {
    this.doc = doc
    this.steps = []
    this.stepClientIDs = []
    this.onNewSteps = []
  }

  receiveSteps(version: number, steps: Step[], clientID: string) {
    if (version != this.steps.length) return

    // Apply and accumulate new steps
    steps.forEach((step: Step) => {
      if (this.doc) {
        this.doc = step.apply(this.doc).doc
        this.steps.push(step)
        this.stepClientIDs.push(clientID)
      }
    })
    // Signal listeners
    this.onNewSteps.forEach(function (f: () => void) {
      f()
    })
  }

  stepsSince(version: number) {
    return {
      steps: this.steps.slice(version),
      clientIDs: this.stepClientIDs.slice(version)
    }
  }
}
