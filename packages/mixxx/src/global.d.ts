import api from './api'
declare global {
  const engine: typeof api.engine
  const midi: typeof api.midi
  const controller: typeof api.controller
  const colorMapper: typeof api.ColorMapper
}
