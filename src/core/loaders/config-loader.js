import config from '../../__dev/buuk-config.js'
import { store } from '../store/index'
import ConfigPrimitive from './config-primitive'

/**
 * Loader to interface buuk-config.js entries.
 *
 */
const configLoader = new Promise((resolve, reject) => {
    // Array of supported options.
    const validOptions = [ "name", "short_name", "sub", "renderer"]

    Object.entries(config).forEach(item => {
        if (validOptions.includes(item[0])) {

            // Load the supported option into our store.
            store.commit('core/setConfig', new ConfigPrimitive(item[0], item[1]))

            // Dispatch an event of type 'config:${config_key}' every time we successfully load a config.
            window.EventBus.$emit(`config:${item[0]}`, item[1])
        }
    })

    // Resolve the loader.
    resolve()
})

export default configLoader