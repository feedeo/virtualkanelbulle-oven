/*
 * Copyright (c) 2016, Feedeo AB <hugo@feedeo.io>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')

const Promise = require('bluebird')
const retry = require('bluebird-retry')

const request = Promise.promisifyAll(require('request'))
const cheerio = require('cheerio')

class VirtualKanelBulleOven {
  getBuns () {
    const uri = 'http://allrecipes.com/recipes/1306/bread/pastries/cinnamon-rolls'

    return retry(() => request.getAsync({ uri }), { max_tries: 3, interval: 500 })
      .then(({ body }) => {
        if (body && body.error) {
          throw new Error(body.error.message)
        }

        const buns = []

        const $ = cheerio.load(body)
        const recipes = $('.grid-fixed .grid-col--fixed-tiles')

        _.forEach(recipes, (recipe) => {
          const url = 'http://allrecipes.com' + $(recipe).find('.grid-col__rec-image').parent().attr('href')
          const imageUrl = $(recipe).find('.grid-col__rec-image').attr('data-original-src')
          const name = $(recipe).find('.grid-col__h3--recipe-grid').text().trim()
          let popularity
          try {
            popularity = parseInt($(recipe).find('.grid-col__reviews format-large-number').attr('number'))
          } catch (error) {
            popularity = 0
          }
          const type = name.toLowerCase().indexOf('bun') > -1 ? 'Bun' : 'Roll'
          const isSticky = name.toLowerCase().indexOf('sticky') > -1

          if (imageUrl && imageUrl !== '' &&
            name && name !== ''
          ) {
            buns.push({ url, imageUrl, name, popularity, type, isSticky })
          }
        })

        return buns
      })
  }
}

module.exports = VirtualKanelBulleOven
