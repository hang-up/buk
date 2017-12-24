import { articles } from './tmp.json'
import { store } from '../store/index'
import ArticlePrimitive from './ArticlePrimitive'

function manifestLoader() {

    let copy = articles

    /*
        1: import manifest
        2: search through manifest
     */

    Object.values(copy).forEach( topLevel => {
        // If we have objects, aka sub categories within this toplevel
        if (!Array.isArray(topLevel)) {
            // console.log(topLevel)
        }
        else {
            // If it's an array, no sub cat and we can proceed with primitiving the articles.
            topLevel.forEach((article, category) => {
                article.primitive = new ArticlePrimitive(article.title).computeValue()
            })
        }
    })


    store.commit({
        type: 'core/setArticles',
        articles: articles
    })
}

export default manifestLoader