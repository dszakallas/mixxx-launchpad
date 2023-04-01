
const eq3 = (deck, col) => {
  return [
    [`knob.0.${col}`, { type: "eq", params: { channel: 'high', deck: deck } }],
    [`knob.1.${col}`, { type: "eq", params: { channel: 'mid', deck: deck } }],
    [`knob.2.${col}`, { type: "eq", params: { channel: 'low', deck: deck } }],
  ]
}

const gain = (deck, col) => {
  return [
    [`fader.0.${col}`, { type: "gain", params: { channel: 'high', deck: deck } }],
  ]
  
}

const deckTemplate = {

}

const conf = {
  templates: {
    deck
  }
}

export default conf
