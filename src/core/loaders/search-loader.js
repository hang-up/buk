import { store } from '../store/index'

/**
 * Fuse can only search arrays that are one level deep.
 * This loader will create a flat array from all the articles previously loaded by manifest-loader.
 *
 * @param rootArticles = store.state.core.articles
 */
function searchLoader(rootArticles = store.state.core.articles) {

    Object.values(rootArticles).forEach( topLevel => {

        /*
            If we have objects (aka sub categories within this level) we recursively load them until
            we end up with an array. An array is the sign that we have POTENTIALLY reached the deepest
            level of sub categories.
          */
        if (!Array.isArray(topLevel)) {
            searchLoader(topLevel)
        }
        else {
            /*
                If we get an array, we MIGHT be at the deepest level of sub categories. This is not a certainty
                since we can have an infinite number of sub categories.
              */
            Object.values(topLevel).forEach((article, category) => {

                /*
                    IMPORTANT:
                    "title" is a reserved keyword. It is how we know if we have further nested categories.
                  */
                if (!article.title) {
                    searchLoader(article)
                }
                else {
                    store.commit({
                        type: 'search/setFlatArticle',
                        article: article
                    })
                }
            })
        }
    })
}

export default searchLoader