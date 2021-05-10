export default class GameEvent extends CustomEvent{
    constructor(name, detail = {}) {
        super(name, {
            bubbles:true,
            detail
        })
    }
}