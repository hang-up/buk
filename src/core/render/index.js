/*eslint-disable */
const marked = require('marked');
const highlightjs = require('./lib/index');
const slugify = require('slugify')
const OPTIONS_TOC = 'toc';

// TODO: Configurable theme.
require('./lib/styles/tomorrow.css');
/*eslint-enable */
/**
 * Renderer class.
 *
 */
class Renderer {
    constructor({ options = undefined } = {}) {
        this.renderer = marked;

        this.rendererWithOptions = new marked.Renderer();
        this.options = options;
    }

    /**
     * Transforms a valid markdown string into its html representation.
     *
     * @param content
     * @returns {*}
     */
    render(content) {
        if (!this.options) {
            return this.renderer(content);
        } else {
            const options = this.setOptionsToRenderer();
            return this.renderWithOptions(options, content);
        }
    }

    /**
     * Set user configured options to renderer. For now, the only options available is
     * toggling a custom table of contents.
     *
     */
    setOptionsToRenderer() {
        if (this.options.includes(OPTIONS_TOC)) {
            try {
                let headers = [];
                this.rendererWithOptions.heading = (text, level) => {
                    // Strip html tags (https://stackoverflow.com/a/822464).
                    const sanitizedText = text.replace(/<(?:.|\n)*?>/gm, '');

                    const sanitizedSlug = slugify(sanitizedText, { lower: true, remove: /[$*_+~.()'"!/\-:@]/g });

                    headers.push({
                        level,
                        text: sanitizedText,
                        slug: `#${sanitizedSlug}`
                    });
                    return `<h${level} id="${sanitizedSlug}">${sanitizedText}</h${level}>`;
                };
                // Returns the list of headers (that I decided to call artifact.)
                return headers;
            } catch (e) {
                throw new (e => `Error: setOptionsToRenderer ${e}`)();
            }
        }
    }

    /**
     * Returns an object containing arbitrary artifacts and the actual parsed content.
     *
     * @param {*} artifacts An optional side effect from generating a custom renderer.
     * @param {*} content The rendered content.
     */
    renderWithOptions(artifacts, content) {
        return {
            artifacts,
            content: this.renderer(content, {
                renderer: this.rendererWithOptions
            })
        };
    }

    /**
     * Apply configuration to our renderer.
     *
     * @param config
     */
    applyConfig(config) {
        this.renderer = marked.setOptions({
            renderer: new marked.Renderer(),
            gfm: true,
            tables: true,
            smartLists: true,
            breaks: config.breaks || true,
            pedantic: config.strict || false,
            sanitize: config.ignore_html || false,
            smartypants: config.smart_typo || false,
            highlight: code => {
                return highlightjs.highlightAuto(code).value;
            },
            langPrefix: 'hljs lang-'
        });
    }
}

export default Renderer;
