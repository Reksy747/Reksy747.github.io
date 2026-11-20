import { register } from '../registry.js'
import { commands as content } from './content.js'
import { commands as shell } from './shell.js'
import { commands as tools } from './tools.js'

export function registerAll() {
  register([...content, ...shell, ...tools])
}
